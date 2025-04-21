import { eq, desc } from 'drizzle-orm';
import { db } from './db';
import { users, apps, versions, analytics, payments } from './schema';
import { sql } from '@vercel/postgres';
import type { NewUser, User, NewApp, App, NewVersion, Version, NewAnalyticsEvent, NewPayment, AppState, UserRole } from './schema';
import { makePoint } from './postgis';

// User queries
export async function getUserByLogtoId(logtoId: string): Promise<User | undefined> {
  if (!logtoId) return undefined;
  const result = await db.select().from(users).where(eq(users.logtoId as any, logtoId));
  return result[0] as User | undefined;
}

export async function createUser(userData: NewUser): Promise<User> {
  const result = await db.insert(users).values(userData).returning();
  return result[0] as User;
}

export async function updateUserRole(userId: string, role: UserRole): Promise<User | undefined> {
  if (!userId) return undefined;
  const result = await db.update(users)
    .set({ role })
    .where(eq(users.id as any, userId))
    .returning();
  return result[0] as User | undefined;
}

// App queries
export async function createApp(appData: Omit<NewApp, 'geoArea'> & { 
  longitude: number; 
  latitude: number; 
  geoRadius?: number 
}): Promise<App> {
  const { longitude, latitude, ...data } = appData;
  
  // Create a PostGIS point for the geo_area
  const point = makePoint(longitude, latitude);
  
  // Helper function to create SQL fragments with UUID
  const getUuidOrDefault = () => {
    if (data.id) return sql`${data.id}`;
    return sql`uuid_generate_v4()`;
  };
  
  // Build the values for the SQL query
  const id = getUuidOrDefault();
  const ownerId = sql`${data.ownerId}`;
  const title = sql`${data.title}`;
  const slug = sql`${data.slug}`;
  const heroUrl = sql`${data.heroUrl}`;
  const category = sql`${data.category}`;
  const priceCents = sql`${data.priceCents || 0}`;
  const isPaid = sql`${data.isPaid || false}`;
  const state = sql`${data.state || 'draft'}`;
  
  // Insert the app with the PostGIS point
  const query = sql`
    INSERT INTO apps (
      id, 
      owner_id, 
      title, 
      slug, 
      hero_url, 
      category, 
      geo_area, 
      price_cents, 
      is_paid, 
      state
    ) 
    VALUES (
      ${id}, 
      ${ownerId}, 
      ${title}, 
      ${slug}, 
      ${heroUrl}, 
      ${category}, 
      ${point}, 
      ${priceCents}, 
      ${isPaid}, 
      ${state}
    )
    RETURNING *
  `;
  
  const result = await query;
  return result.rows[0] as App;
}

export async function getAppBySlug(slug: string): Promise<App | undefined> {
  if (!slug) return undefined;
  const result = await db.select().from(apps).where(eq(apps.slug as any, slug));
  return result[0] as App | undefined;
}

export async function getAppsByOwnerId(ownerId: string): Promise<App[]> {
  if (!ownerId) return [];
  const result = await db.select().from(apps).where(eq(apps.ownerId as any, ownerId));
  return result as App[];
}

export async function getPublishedApps(limit: number = 10, offset: number = 0): Promise<App[]> {
  const result = await db.select()
    .from(apps)
    .where(eq(apps.state as any, 'published'))
    .limit(limit)
    .offset(offset);
  return result as App[];
}

export async function updateAppState(appId: string, state: AppState): Promise<App | undefined> {
  if (!appId) return undefined;
  const result = await db.update(apps)
    .set({ state })
    .where(eq(apps.id as any, appId))
    .returning();
  return result[0] as App | undefined;
}

// Version queries
export async function createVersion(versionData: NewVersion): Promise<Version> {
  const result = await db.insert(versions).values(versionData).returning();
  return result[0] as Version;
}

export async function getVersionsByAppId(appId: string): Promise<Version[]> {
  if (!appId) return [];
  const result = await db.select()
    .from(versions)
    .where(eq(versions.appId as any, appId))
    .orderBy(desc(versions.createdAt as any));
  return result as Version[];
}

export async function getLatestVersionByAppId(appId: string): Promise<Version | undefined> {
  if (!appId) return undefined;
  const result = await db.select()
    .from(versions)
    .where(eq(versions.appId as any, appId))
    .orderBy(desc(versions.createdAt as any))
    .limit(1);
  return result[0] as Version | undefined;
}

// Analytics queries
export async function recordAnalyticsEvent(eventData: NewAnalyticsEvent): Promise<void> {
  // Convert any metadata to a JSON string for the database
  const data = {...eventData};
  
  if (data.metadata) {
    // We'll handle this with a raw SQL query since our schema doesn't fully define columns
    const { appId, userId, event, ts = new Date(), metadata } = data;
    
    await sql`
      INSERT INTO analytics (app_id, user_id, event, ts, metadata)
      VALUES (${appId}, ${userId}, ${event}, ${ts}, ${JSON.stringify(metadata)})
    `;
  } else {
    // Use drizzle ORM for simple inserts
    await db.insert(analytics).values(eventData);
  }
}

export async function getAppEvents(appId: string, limit: number = 100): Promise<any[]> {
  if (!appId) return [];
  const result = await db.select()
    .from(analytics)
    .where(eq(analytics.appId as any, appId))
    .orderBy(desc(analytics.ts as any))
    .limit(limit);
  return result;
}

// Payment queries
export async function recordPayment(paymentData: NewPayment): Promise<void> {
  await db.insert(payments).values(paymentData);
}

export async function getAppPayments(appId: string): Promise<any[]> {
  if (!appId) return [];
  const result = await db.select()
    .from(payments)
    .where(eq(payments.appId as any, appId))
    .orderBy(desc(payments.ts as any));
  return result;
}

// Export default object for compatibility with imports
const queries = {
  getUserByLogtoId,
  createUser,
  updateUserRole,
  createApp,
  getAppBySlug,
  getAppsByOwnerId,
  getPublishedApps,
  updateAppState,
  createVersion,
  getVersionsByAppId,
  getLatestVersionByAppId,
  recordAnalyticsEvent,
  getAppEvents,
  recordPayment,
  getAppPayments
};

export default queries;