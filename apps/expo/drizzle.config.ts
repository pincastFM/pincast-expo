import type { Config } from 'drizzle-kit';
import dotenv from 'dotenv';
import { resolve } from 'path';

// Get current environment
const env = process.env.NODE_ENV || 'development';
console.log(`🌍 Using ${env.toUpperCase()} database for Drizzle operations`);

// Load base environment variables
dotenv.config({ path: resolve(process.cwd(), '../../.env') });
dotenv.config({ path: resolve(process.cwd(), '.env') });

// Load environment-specific variables
dotenv.config({ path: resolve(process.cwd(), `../../.env.${env}`) });
dotenv.config({ path: resolve(process.cwd(), `.env.${env}`) });

export default <Config>{
  schema: './server/db/schema.ts',
  out: './migrations/generated',
  driver: 'pg',
  dbCredentials: { connectionString: process.env.POSTGRES_URL! }
};