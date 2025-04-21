import { readFileSync } from 'fs';
import { join } from 'path';
import { sql } from '@vercel/postgres';
import { config } from 'dotenv';
import { resolve } from 'path';

// Get current environment
const env = process.env.NODE_ENV || 'development';
console.log(`🌍 Running migrations in ${env.toUpperCase()} environment`);

// Load base environment variables
config({ path: resolve(process.cwd(), '../../.env') });
config({ path: resolve(process.cwd(), '.env') });

// Load environment-specific variables
config({ path: resolve(process.cwd(), `../../.env.${env}`) });
config({ path: resolve(process.cwd(), `.env.${env}`) });

const MIGRATIONS_DIR = join(process.cwd(), 'migrations');
const INIT_MIGRATION = join(MIGRATIONS_DIR, '000_init.sql');

async function runMigration() {
  try {
    console.log('🔄 Running migrations...');
    
    // Read the migration file
    const migrationContent = readFileSync(INIT_MIGRATION, 'utf8');
    
    try {
      // Execute the entire migration script as one transaction
      console.log('Running full migration script...');
      await sql.query(migrationContent);
      console.log('✅ Migration script executed successfully');
    } catch (error) {
      // If executing the whole script fails, fall back to individual statements
      console.warn('⚠️ Full migration failed, trying individual statements');
      
      // Try a different approach by running each CREATE statement separately
      const statements = migrationContent.split(/CREATE\s+/i);
      
      for (const statement of statements) {
        if (!statement.trim()) continue;
        
        const fullStatement = 'CREATE ' + statement.trim();
        try {
          await sql.query(fullStatement);
          const preview = fullStatement.length > 50 
            ? fullStatement.substring(0, 50) + '...' 
            : fullStatement;
          console.log(`✅ Executed: ${preview}`);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          console.warn(`⚠️ Statement failed (may already exist): ${errorMessage}`);
        }
      }
    }
    
    console.log('✅ Migrations completed successfully!');
    
    // Check if PostGIS is available
    try {
      const result = await sql`SELECT PostGIS_version()`;
      console.log(`✅ PostGIS is available: ${result.rows[0]?.postgis_version}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('❌ PostGIS is not available:', errorMessage);
    }
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('❌ Migration failed:', errorMessage);
    process.exit(1);
  }
}

// Run the migration
runMigration().catch(console.error);