import { createPool } from '@vercel/postgres';
import type { VercelPoolClient } from '@vercel/postgres';

// Create a connection pool for Postgres
export const pool = createPool({
  connectionString: process.env.POSTGRES_URL
});

// Helper function to get a client from the pool
export async function getClient(): Promise<VercelPoolClient> {
  return await pool.connect();
}

// Example query function with proper connection handling
export async function executeQuery<T>(
  query: string, 
  params: any[] = []
): Promise<T[]> {
  const client = await getClient();
  
  try {
    const result = await client.query(query, params);
    return result.rows as T[];
  } finally {
    client.release();
  }
}