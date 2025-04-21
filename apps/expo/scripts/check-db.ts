import { config } from 'dotenv';
import { resolve } from 'path';
import { sql } from '@vercel/postgres';

// Get current environment
const env = process.env.NODE_ENV || 'development';
console.log(`🌍 Checking database in ${env.toUpperCase()} environment`);

// Load base environment variables
config({ path: resolve(process.cwd(), '../../.env') });
config({ path: resolve(process.cwd(), '.env') });

// Load environment-specific variables
config({ path: resolve(process.cwd(), `../../.env.${env}`) });
config({ path: resolve(process.cwd(), `.env.${env}`) });

async function checkDatabase() {
  try {
    console.log('🔍 Checking database connection...');
    
    // Check PostGIS
    const postgisResult = await sql`SELECT PostGIS_version()`;
    console.log(`✅ Database connected!`);
    console.log(`PostGIS version: ${postgisResult.rows[0]?.postgis_version || 'not available'}`);
    
    // Check users table
    const usersResult = await sql`SELECT id, email, role FROM users ORDER BY created_at DESC LIMIT 10`;
    const userCount = usersResult.rowCount ?? 0; // Use nullish coalescing for safety
    console.log(`\n📋 Users in database: ${userCount}`);
    if (userCount > 0) {
      console.table(usersResult.rows);
    }
    
    // Check apps table
    const appsResult = await sql`SELECT id, title, slug, state FROM apps ORDER BY created_at DESC LIMIT 10`;
    const appCount = appsResult.rowCount ?? 0; // Use nullish coalescing for safety
    console.log(`\n📱 Apps in database: ${appCount}`);
    if (appCount > 0) {
      console.table(appsResult.rows);
    }
    
    // Check versions table
    const versionsResult = await sql`SELECT id, app_id, semver FROM versions ORDER BY created_at DESC LIMIT 10`;
    const versionCount = versionsResult.rowCount ?? 0; // Use nullish coalescing for safety
    console.log(`\n🔢 Versions in database: ${versionCount}`);
    if (versionCount > 0) {
      console.table(versionsResult.rows);
    }
    
    console.log('\n✅ Database check completed successfully');
    return true;
  } catch (error) {
    console.error('❌ Error checking database:', error);
    return false;
  }
}

// Run the check function
console.log('🏁 Starting database check...');
checkDatabase()
  .then((success) => {
    console.log(success ? '✅ Database validated successfully!' : '❌ Database check failed');
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  });