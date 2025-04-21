import { sql } from '@vercel/postgres';

/**
 * Creates a PostGIS point with the specified longitude and latitude
 * Uses SRID 4326 (WGS84) which is the standard for geographic coordinates
 * Returns SQL fragment for use in queries
 */
export function makePoint(longitude: number, latitude: number) {
  return sql`ST_SetSRID(ST_Point(${longitude}, ${latitude}), 4326)`;
}

/**
 * Calculates the distance between two points in meters
 * Returns SQL fragment for use in queries
 */
export function distance(geom1: any, geom2: any) {
  return sql`ST_Distance(${geom1}::geography, ${geom2}::geography)`;
}

/**
 * Checks if a point is within a specified distance of another point
 * @param geom1 First geometry
 * @param geom2 Second geometry
 * @param distanceMeters Distance in meters
 * @returns SQL fragment for the distance check
 */
export function withinDistance(geom1: any, geom2: any, distanceMeters: number) {
  return sql`ST_DWithin(${geom1}::geography, ${geom2}::geography, ${distanceMeters})`;
}

/**
 * Converts geometry to text representation
 * Returns SQL fragment for use in queries
 */
export function asText(geom: any) {
  return sql`ST_AsText(${geom})`;
}

/**
 * Checks if PostGIS is available in the database
 * Returns true if PostGIS is available
 */
export async function checkPostGIS(): Promise<boolean> {
  try {
    const result = await sql`SELECT PostGIS_version()`;
    return !!result.rows[0]?.postgis_version;
  } catch (error) {
    console.error('PostGIS may not be available:', error);
    return false;
  }
}