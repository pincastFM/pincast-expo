import { drizzle } from 'drizzle-orm/vercel-postgres';
import { sql } from '@vercel/postgres';
import * as schema from './schema';
import './dotenv'; // Import environment variables
import { makePoint, checkPostGIS as checkPostGISFn, withinDistance, asText, distance } from './postgis';
import type { App } from './schema';

// Log which database we're connecting to based on environment
const env = process.env.NODE_ENV || 'development';
console.log(`📊 Connecting to ${env.toUpperCase()} database: ${process.env.POSTGRES_URL}`);

// Create a db connection with the schema
export const db = drizzle(sql, { schema });

// Composable for server routes to get db instance
export const useDb = () => {
  return db;
};

// Re-export PostGIS functions
export { makePoint, withinDistance, asText, distance };
export const checkPostGIS = checkPostGISFn;

// Geospatial query to find apps within a specified radius (in meters)
export async function findAppsNearby(longitude: number, latitude: number, radiusMeters: number = 1000): Promise<App[]> {
  try {
    const point = makePoint(longitude, latitude);
    
    // First create the SQL fragment for the location text
    const aGeoArea = sql`a.geo_area`;
    const locationQuery = asText(aGeoArea);
    // Then create the SQL fragment for the distance
    const distanceQuery = distance(aGeoArea, point);
    // Then create the SQL fragment for the where clause
    const whereQuery = withinDistance(aGeoArea, point, radiusMeters);
    
    // Now use all these fragments in the main query
    const query = sql`
      SELECT 
        a.id, 
        a.title, 
        a.slug, 
        a.hero_url, 
        a.category,
        a.price_cents,
        a.is_paid,
        a.state,
        ${locationQuery} as location,
        ${distanceQuery} as distance
      FROM apps a
      WHERE 
        ${whereQuery}
      AND a.state = 'published'
      ORDER BY distance
    `;
    
    const result = await query;
    // Return the results as App[]
    return result.rows as unknown as App[];
  } catch (error) {
    console.error('Error querying nearby apps:', error);
    throw error;
  }
}