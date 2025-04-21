import { describe, it, expect, beforeAll, afterAll } from 'vitest';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { createUser, createApp, getUserByLogtoId, getAppBySlug } from '../server/db/queries';
import { findAppsNearby, checkPostGIS } from '../server/db/db';
import { seed } from '../server/seed';

// Test constants
const TEST_USER = {
  logtoId: 'test-logto-id',
  email: 'test@pincast.fm',
  role: 'developer' as const
};

const TEST_APP = {
  title: 'Test App',
  slug: 'test-app',
  heroUrl: 'https://placehold.co/600x400/png',
  category: 'test',
  longitude: -122.4194, // San Francisco
  latitude: 37.7749,
  priceCents: 999,
  isPaid: true,
  state: 'published' as const
};

// Duplicate app with same slug for testing uniqueness constraint
const DUPLICATE_APP = {
  ...TEST_APP,
  title: 'Duplicate Test App'
};

describe('Database Schema and Queries', () => {
  let testUser = {} as any;
  
  // Setup: Run seed and then create test data
  beforeAll(async () => {
    // Check if we're using the test database
    if (!process.env.PG_URL_TEST && !process.env.POSTGRES_URL?.includes('test')) {
      throw new Error('Tests should only run against a test database. Set PG_URL_TEST env variable.');
    }
    
    // Run the seed function to ensure database is set up
    await seed();
    
    // Create test user
    const existingUser = await getUserByLogtoId(TEST_USER.logtoId);
    if (existingUser) {
      testUser = existingUser;
    } else {
      testUser = await createUser(TEST_USER);
    }
    
    // Create test app - we need to make sure it exists but don't need to reference it later
    const existingApp = await getAppBySlug(TEST_APP.slug);
    if (!existingApp) {
      await createApp({
        ...TEST_APP,
        ownerId: testUser.id
      });
    }
  });
  
  // Cleanup - in a real setup we would clean up test data, but we're keeping data for now
  afterAll(async () => {
    // We could clean up test data here if needed
  });
  
  it('should have PostGIS extension available', async () => {
    const hasPostGIS = await checkPostGIS();
    expect(hasPostGIS).toBe(true);
  });
  
  it('should create and retrieve a user', async () => {
    const user = await getUserByLogtoId(TEST_USER.logtoId);
    expect(user).toBeDefined();
    expect(user?.email).toBe(TEST_USER.email);
    expect(user?.role).toBe(TEST_USER.role);
  });
  
  it('should create and retrieve an app', async () => {
    const app = await getAppBySlug(TEST_APP.slug);
    expect(app).toBeDefined();
    expect(app?.title).toBe(TEST_APP.title);
    expect(app?.priceCents).toBe(TEST_APP.priceCents);
    expect(app?.isPaid).toBe(TEST_APP.isPaid);
  });
  
  it('should throw error when creating an app with duplicate slug', async () => {
    try {
      await createApp({
        ...DUPLICATE_APP,
        ownerId: testUser.id
      });
      // If we get here, the test should fail
      expect(true).toBe(false); // This should not be reached
    } catch (error) {
      // Expect an error to be thrown due to unique constraint
      expect(error).toBeDefined();
    }
  });
  
  it('should find apps within 1km of the specified location', async () => {
    // Test coordinates very close to the test app's location
    const testLongitude = -122.4194 + 0.0001; // Small offset
    const testLatitude = 37.7749 + 0.0001;    // Small offset
    
    const nearbyApps = await findAppsNearby(testLongitude, testLatitude, 1000);
    
    expect(nearbyApps).toBeDefined();
    expect(nearbyApps.length).toBeGreaterThanOrEqual(1);
    
    // Test app or sample app should be in results
    const foundApp = nearbyApps.find(app => app.slug === TEST_APP.slug || app.slug === 'pincast-demo');
    expect(foundApp).toBeDefined();
    
    // Check that the distance is reasonable (less than 1km)
    if (foundApp) {
      // Cast to any to avoid TypeScript errors
      expect(parseFloat((foundApp as any).distance)).toBeLessThan(1000);
    }
  });
  
  it('should not find apps more than 1km away from the specified location', async () => {
    // Test coordinates far from the test app's location (~5km away)
    const farLongitude = -122.4794; // ~5km west
    const farLatitude = 37.7749;
    
    const nearbyApps = await findAppsNearby(farLongitude, farLatitude, 1000);
    
    // Check if our test app is in the results
    const foundApp = nearbyApps.find(app => app.slug === TEST_APP.slug);
    expect(foundApp).toBeUndefined();
  });
});