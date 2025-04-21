import { defineEventHandler } from 'h3';
import { db } from '~/server/db/db';
import { apps, users, versions } from '~/server/db/schema';
import { eq, desc, sql } from 'drizzle-orm';
import runtime from '~/server/utils/runtime';

const { assertString, assertDefined } = runtime;

// App detail response type
export type AppDetail = {
  id: string;
  title: string;
  slug: string;
  heroUrl: string | null;
  ownerName: string;
  buildUrl: string;
  semver: string;
  geo: {
    center: [number, number]; // [longitude, latitude]
    radiusMeters: number;
  };
};

interface HttpError extends Error {
  statusCode: number;
}

/**
 * Creates an HTTP error with status code
 */
function createHttpError(statusCode: number, message: string): HttpError {
  const error = new Error(message) as HttpError;
  error.statusCode = statusCode;
  return error;
}

export default defineEventHandler(async (event) => {
  try {
    // Get app slug from URL parameter
    const slug = assertString(event.context.params?.slug, 'App slug is required');
    
    // Query the app by slug, ensure it's published
    const appResults = await db
      .select({
        id: apps.id,
        title: apps.title,
        slug: apps.slug,
        heroUrl: apps.heroUrl,
        ownerId: apps.ownerId,
        geoArea: apps.geoArea,
        geoRadius: apps.geoRadius,
      })
      .from(apps)
      .where(eq(apps.slug, slug))
      .where(eq(apps.state, 'published'))
      .limit(1);
    
    // Check if app exists
    if (!appResults || appResults.length === 0) {
      throw createHttpError(404, `App with slug "${slug}" not found or not published`);
    }
    
    // Get the first (and only) result
    const app = appResults[0];
    
    // Ensure app is defined
    if (!app) {
      throw createHttpError(404, `App with slug "${slug}" not found or not published`);
    }
    
    // Assert that app has required properties
    assertDefined(app.id, `App with slug "${slug}" has missing ID`);
    assertDefined(app.title, `App with slug "${slug}" has missing title`);
    assertDefined(app.slug, `App with slug "${slug}" has missing slug`);
    assertDefined(app.ownerId, `App with slug "${slug}" has missing owner ID`);
    
    // Get app owner information
    const ownerResults = await db
      .select({
        email: users.email,
        name: users.name,
      })
      .from(users)
      .where(eq(users.id, app.ownerId))
      .limit(1);
    
    // We don't throw if owner isn't found, just use a fallback
    const owner = ownerResults.length > 0 ? ownerResults[0] : null;
    
    // Get the latest version with buildUrl
    const versionResults = await db
      .select({
        id: versions.id,
        semver: versions.semver,
        deployUrl: versions.deployUrl,
        createdAt: versions.createdAt,
      })
      .from(versions)
      .where(eq(versions.appId, app.id))
      .orderBy(desc(versions.createdAt))
      .limit(1);
    
    if (!versionResults || versionResults.length === 0) {
      throw createHttpError(404, `No deployed versions found for app "${slug}"`);
    }
    
    const latestVersion = assertDefined(versionResults[0], `No deployed versions found for app "${slug}"`);
    
    // Extract geo coordinates from PostGIS point
    // Format: POINT(longitude latitude)
    const geoResults = await db
      .select({
        point: sql<string>`ST_AsText(${apps.geoArea})`,
      })
      .from(apps)
      .where(eq(apps.id, app.id))
      .limit(1);
    
    if (!geoResults || geoResults.length === 0) {
      throw createHttpError(500, `Could not retrieve geo data for app "${slug}"`);
    }
    
    const geoText = assertDefined(geoResults[0], `Invalid geo data for app "${slug}"`);
    const pointMatch = /POINT\(([-.0-9]+) ([-.0-9]+)\)/.exec(geoText.point);
    
    if (!pointMatch || pointMatch.length < 3) {
      throw createHttpError(500, `Invalid geo format for app "${slug}"`);
    }
    
    // Ensure group matches exist before parsing
    const longitudeStr = pointMatch[1];
    const latitudeStr = pointMatch[2];
    
    // Handle the case where the coordinates might be undefined
    if (!longitudeStr || !latitudeStr) {
      throw createHttpError(500, `Invalid geo coordinates for app "${slug}"`);
    }
    
    const longitude = parseFloat(longitudeStr);
    const latitude = parseFloat(latitudeStr);
    
    if (isNaN(longitude) || isNaN(latitude)) {
      throw createHttpError(500, `Invalid geo coordinates for app "${slug}"`);
    }
    
    // Format the response with safe defaults for nullable values
    const appDetail: AppDetail = {
      id: app.id,
      title: app.title,
      slug: app.slug,
      heroUrl: app.heroUrl,
      ownerName: owner?.name || owner?.email || 'Unknown Developer',
      buildUrl: latestVersion.deployUrl || '',
      semver: latestVersion.semver,
      geo: {
        center: [longitude, latitude],
        radiusMeters: app.geoRadius || 1000, // Default to 1km if not specified
      }
    };
    
    return appDetail;
  } catch (error) {
    console.error('Error fetching app details:', error);
    
    // Determine if this is our own HttpError or an unknown error
    const isHttpError = error && 
      typeof error === 'object' && 
      'statusCode' in error && 
      typeof (error as HttpError).statusCode === 'number';
    
    if (isHttpError) {
      // Re-throw our own errors with proper statusCode
      throw error;
    } else {
      // Wrap unknown errors
      throw createHttpError(
        500, 
        error instanceof Error ? error.message : 'Failed to fetch app details'
      );
    }
  }
});