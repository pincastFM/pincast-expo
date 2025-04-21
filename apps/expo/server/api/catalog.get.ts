import { defineEventHandler, getQuery } from 'h3';
import { db } from '~/server/db/db';
import { apps, analytics } from '~/server/db/schema';
import { eq, desc, sql } from 'drizzle-orm';
import runtime from '~/server/utils/runtime';

const { assertNumber } = runtime;

// Maximum allowed radius in meters
const MAX_RADIUS = 200000; // 200km
const DEFAULT_RADIUS = 50000; // 50km

// Valid sort options
type SortOption = 'distance' | 'popularity' | 'newest';
const validSortOptions: SortOption[] = ['distance', 'popularity', 'newest'];

// Catalog response type
export interface CatalogItem {
  id: string;
  title: string;
  slug: string;
  heroUrl: string | null;
  distanceMeters?: number;
  sessions7d: number;
}

// HTTP Error interface
interface HttpError extends Error {
  statusCode: number;
}

export default defineEventHandler(async (event) => {
  try {
    // Get query parameters
    const query = getQuery(event);
    
    // Optional parameters with defaults
    const sort = (query.sort as SortOption) || 'distance';
    const radius = Math.min(Number(query.radius || DEFAULT_RADIUS), MAX_RADIUS);
    
    // Validate sort option
    if (!validSortOptions.includes(sort)) {
      throw createHttpError(400, `Invalid sort option. Valid options are: ${validSortOptions.join(', ')}`);
    }
    
    // If sort is distance, lat and lng are required
    let lat: number | undefined;
    let lng: number | undefined;
    
    if (sort === 'distance') {
      // Parse and validate lat/lng
      if (!query.lat || !query.lng) {
        throw createHttpError(400, 'Latitude and longitude are required when using distance sort');
      }
      
      // Convert to number and validate 
      const latNum = Number(query.lat);
      const lngNum = Number(query.lng);
      
      if (isNaN(latNum) || isNaN(lngNum)) {
        throw createHttpError(400, 'Latitude and longitude must be valid numbers');
      }
      
      lat = assertNumber(latNum, 'Invalid latitude');
      lng = assertNumber(lngNum, 'Invalid longitude');
      
      // Basic validation
      if (lat < -90 || lat > 90) {
        throw createHttpError(400, 'Latitude must be between -90 and 90');
      }
      if (lng < -180 || lng > 180) {
        throw createHttpError(400, 'Longitude must be between -180 and 180');
      }
    }
    
    // Base query to get published apps
    let appsQuery = db
      .select({
        id: apps.id,
        title: apps.title,
        slug: apps.slug,
        heroUrl: apps.heroUrl,
        // Default sessions7d to 0 if no analytics data
        sessions7d: sql<number>`COALESCE(COUNT(${analytics.id}), 0)`.as('sessions7d'),
      })
      .from(apps)
      .leftJoin(
        analytics,
        sql`${analytics.appId} = ${apps.id} AND ${analytics.event} = 'session_start' AND 
            ${analytics.ts} > NOW() - INTERVAL '7 days'`
      )
      .where(eq(apps.state, 'published'))
      .groupBy(apps.id);
    
    // Add distance calculation and filtering if lat/lng provided
    if (sort === 'distance' && lat !== undefined && lng !== undefined) {
      appsQuery = db
        .select({
          id: apps.id,
          title: apps.title,
          slug: apps.slug,
          heroUrl: apps.heroUrl,
          sessions7d: sql<number>`COALESCE(COUNT(${analytics.id}), 0)`.as('sessions7d'),
          distanceMeters: sql<number>`
            ST_Distance(
              ${apps.geoArea},
              ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography
            )
          `.as('distance_meters'),
        })
        .from(apps)
        .leftJoin(
          analytics,
          sql`${analytics.appId} = ${apps.id} AND ${analytics.event} = 'session_start' AND 
              ${analytics.ts} > NOW() - INTERVAL '7 days'`
        )
        .where(eq(apps.state, 'published'))
        .where(sql`
          ST_DWithin(
            ${apps.geoArea}::geography,
            ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography,
            ${radius}
          )
        `)
        .groupBy(apps.id, sql`distance_meters`);
    }
    
    // Apply sorting
    switch (sort) {
      case 'distance':
        appsQuery = appsQuery.orderBy(sql`distance_meters`);
        break;
      case 'popularity':
        appsQuery = appsQuery.orderBy(desc(sql`sessions7d`));
        break;
      case 'newest':
        // For newest, we need a subquery to get the latest version timestamp
        appsQuery = appsQuery
          .leftJoin(
            sql`(
              SELECT app_id, MAX(created_at) as latest_version
              FROM versions
              GROUP BY app_id
            ) as latest_versions`,
            sql`${apps.id} = latest_versions.app_id`
          )
          .orderBy(desc(sql`latest_versions.latest_version`));
        break;
    }
    
    // Execute the query
    const results = await appsQuery;
    
    // Map the results to our response type
    const catalogItems: CatalogItem[] = results.map(item => {
      const catalogItem: CatalogItem = {
        id: item.id,
        title: item.title,
        slug: item.slug,
        heroUrl: item.heroUrl,
        sessions7d: Number(item.sessions7d) || 0
      };
      
      // Add distance if available
      if ('distanceMeters' in item && typeof item.distanceMeters === 'number') {
        catalogItem.distanceMeters = Math.round(item.distanceMeters);
      }
      
      return catalogItem;
    });
    
    return catalogItems;
  } catch (error) {
    console.error('Error fetching catalog:', error);
    throw createHttpError(
      400,
      error instanceof Error ? error.message : 'Failed to fetch catalog'
    );
  }
});

// Helper function to create error with status code
/**
 * Creates an HTTP error with status code
 */
function createHttpError(statusCode: number, message: string): HttpError {
  const error = new Error(message) as HttpError;
  error.statusCode = statusCode;
  return error;
}