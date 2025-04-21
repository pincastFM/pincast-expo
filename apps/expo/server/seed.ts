import { config } from 'dotenv';
import { resolve } from 'path';
import { sql } from '@vercel/postgres';

// Get current environment
const env = process.env.NODE_ENV || 'development';
console.log(`🌍 Running seed in ${env.toUpperCase()} environment`);

// Load base environment variables
config({ path: resolve(process.cwd(), '../../.env') });
config({ path: resolve(process.cwd(), '.env') });

// Load environment-specific variables
config({ path: resolve(process.cwd(), `../../.env.${env}`) });
config({ path: resolve(process.cwd(), `.env.${env}`) });

// Sample data for seeding
const SEED_STAFF = {
  logtoId: process.env.SEED_LOGTO_ID_STAFF || 'staff-1234',
  email: process.env.SEED_EMAIL_STAFF || 'staff@pincast.fm',
  role: 'staff' as const
};

const SEED_DEVELOPER = {
  logtoId: process.env.SEED_LOGTO_ID_DEV || 'dev-1234',
  email: process.env.SEED_EMAIL_DEV || 'developer@pincast.fm',
  role: 'developer' as const
};

const SAMPLE_APP = {
  title: 'Pincast Demo App',
  slug: 'pincast-demo',
  heroUrl: 'https://placehold.co/600x400/png',
  category: 'demo',
  longitude: -122.4194, // San Francisco
  latitude: 37.7749,
  priceCents: 0,
  isPaid: false,
  state: 'published' as const
};

const SAMPLE_VERSION = {
  semver: '1.0.0',
  changelog: 'Initial release',
  lighthouseScore: 95,
  repoUrl: 'https://github.com/pincast-expo/demo-app',
  deployUrl: 'https://demo.pincast.fm'
};

// Main seeding function
export async function seed() {
  console.log('🌱 Starting database seeding...');
  
  try {
    // Check database connection and PostGIS
    console.log('🔍 Checking database connection...');
    const postgisResult = await sql`SELECT PostGIS_version()`;
    const postgisVersion = postgisResult.rows[0]?.postgis_version || 'unknown';
    console.log(`✅ Database connected and PostGIS is available: ${postgisVersion}`);
    
    // Create staff user if not exists
    const staffCheck = await sql`SELECT * FROM users WHERE logto_id = ${SEED_STAFF.logtoId}`;
    let staffUser = staffCheck.rows[0];
    
    if (!staffUser) {
      const insertResult = await sql`
        INSERT INTO users (logto_id, email, role) 
        VALUES (${SEED_STAFF.logtoId}, ${SEED_STAFF.email}, ${SEED_STAFF.role})
        RETURNING *
      `;
      staffUser = insertResult.rows[0];
      console.log(`✅ Created staff user: ${staffUser.email}`);
    } else {
      console.log(`✅ Staff user already exists: ${staffUser.email}`);
    }
    
    // Create developer user if not exists
    const devCheck = await sql`SELECT * FROM users WHERE logto_id = ${SEED_DEVELOPER.logtoId}`;
    let devUser = devCheck.rows[0];
    
    if (!devUser) {
      const insertResult = await sql`
        INSERT INTO users (logto_id, email, role) 
        VALUES (${SEED_DEVELOPER.logtoId}, ${SEED_DEVELOPER.email}, ${SEED_DEVELOPER.role})
        RETURNING *
      `;
      devUser = insertResult.rows[0];
      console.log(`✅ Created developer user: ${devUser.email}`);
    } else {
      console.log(`✅ Developer user already exists: ${devUser.email}`);
    }
    
    // Create sample app if not exists
    const appSlugCheck = await sql`SELECT * FROM apps WHERE slug = ${SAMPLE_APP.slug}`;
    if (appSlugCheck.rowCount === 0) {
      // Create a PostGIS point
      const geoPoint = sql`ST_SetSRID(ST_Point(${SAMPLE_APP.longitude}, ${SAMPLE_APP.latitude}), 4326)`;
      
      // Insert the app
      const appInsert = await sql`
        INSERT INTO apps (
          owner_id, title, slug, hero_url, category, geo_area, price_cents, is_paid, state
        ) VALUES (
          ${devUser.id}, ${SAMPLE_APP.title}, ${SAMPLE_APP.slug}, ${SAMPLE_APP.heroUrl}, 
          ${SAMPLE_APP.category}, ${geoPoint}, ${SAMPLE_APP.priceCents}, ${SAMPLE_APP.isPaid}, ${SAMPLE_APP.state}
        )
        RETURNING *
      `;
      const app = appInsert.rows[0];
      console.log(`✅ Created sample app: ${app.title}`);
      
      // Create sample version
      const versionInsert = await sql`
        INSERT INTO versions (
          app_id, semver, changelog, lighthouse_score, repo_url, deploy_url
        ) VALUES (
          ${app.id}, ${SAMPLE_VERSION.semver}, ${SAMPLE_VERSION.changelog}, 
          ${SAMPLE_VERSION.lighthouseScore}, ${SAMPLE_VERSION.repoUrl}, ${SAMPLE_VERSION.deployUrl}
        )
        RETURNING *
      `;
      const version = versionInsert.rows[0];
      console.log(`✅ Created sample version: ${version.semver}`);
    } else {
      console.log(`✅ Sample app already exists: ${SAMPLE_APP.title}`);
    }
    
    console.log('🌱 Seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }
}

// Adding better console logging
console.log('🔄 Starting seed process...');

// Run the seed function immediately (ESM doesn't have require.main === module)
seed()
  .then(() => {
    console.log('✅ Database seeding completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  });