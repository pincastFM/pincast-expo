import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { sql } from '@vercel/postgres';
import { recordAnalyticsEvent } from '~/server/db/queries';
import { v4 as uuidv4 } from 'uuid';

// Test database interactions
describe('Analytics Database Layer', () => {
  // Test data
  const testUserId = uuidv4();
  const testAppId = uuidv4();
  
  // Seed database with test user and app
  beforeAll(async () => {
    // Insert test user
    await sql`
      INSERT INTO users (id, logto_id, role)
      VALUES (${testUserId}, 'test-logto-id', 'player')
      ON CONFLICT (id) DO NOTHING
    `;
    
    // Insert test app
    await sql`
      INSERT INTO apps (id, owner_id, title, slug, state)
      VALUES (${testAppId}, ${testUserId}, 'Test App', 'test-app', 'published')
      ON CONFLICT (id) DO NOTHING
    `;
  });
  
  // Clean up test data after tests
  afterAll(async () => {
    // Delete test analytics data
    await sql`DELETE FROM analytics WHERE app_id = ${testAppId}`;
  });
  
  it('should record analytics events correctly', async () => {
    // Arrange
    const testEvent = {
      appId: testAppId,
      userId: testUserId,
      event: 'test_event',
      ts: new Date(),
      metadata: { test: 'data' }
    };
    
    // Act
    await recordAnalyticsEvent(testEvent);
    
    // Assert - verify the event was recorded
    const result = await sql`
      SELECT * FROM analytics 
      WHERE app_id = ${testAppId} 
      AND event = 'test_event'
      ORDER BY ts DESC
      LIMIT 1
    `;
    
    expect(result.rows.length).toBe(1);
    expect(result.rows[0].app_id).toBe(testAppId);
    expect(result.rows[0].user_id).toBe(testUserId);
    expect(result.rows[0].event).toBe('test_event');
    expect(result.rows[0].metadata).toEqual({ test: 'data' });
  });
  
  it('should update the materialized view after recording session_start events', async () => {
    // Arrange - create test session starts
    const sessionEvent = {
      appId: testAppId,
      userId: testUserId,
      event: 'session_start',
      ts: new Date(),
      metadata: { test: 'session' }
    };
    
    // Act - record multiple session events
    await recordAnalyticsEvent(sessionEvent);
    await recordAnalyticsEvent(sessionEvent);
    await recordAnalyticsEvent(sessionEvent);
    
    // Manually refresh the materialized view
    await sql`SELECT refresh_analytics_week()`;
    
    // Assert - check the materialized view for the expected count
    const viewResult = await sql`
      SELECT * FROM analytics_week
      WHERE app_id = ${testAppId}
    `;
    
    expect(viewResult.rows.length).toBe(1);
    expect(viewResult.rows[0].app_id).toBe(testAppId);
    expect(Number(viewResult.rows[0].sessions7d)).toBeGreaterThanOrEqual(3);
  });
  
  it('should correctly filter by time window in the materialized view', async () => {
    // Arrange - create an event with an older timestamp (outside the 7-day window)
    const oldEvent = {
      appId: testAppId,
      userId: testUserId,
      event: 'session_start',
      // Set timestamp to 8 days ago
      ts: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      metadata: { test: 'old_session' }
    };
    
    // Insert the old event directly using SQL to bypass the default timestamp
    await sql`
      INSERT INTO analytics (app_id, user_id, event, ts, metadata)
      VALUES (${oldEvent.appId}, ${oldEvent.userId}, ${oldEvent.event}, ${oldEvent.ts}, ${JSON.stringify(oldEvent.metadata)})
    `;
    
    // Act - refresh the materialized view
    await sql`SELECT refresh_analytics_week()`;
    
    // Assert - old event should not be counted in the materialized view
    const rawCount = await sql`
      SELECT COUNT(*) as count FROM analytics
      WHERE app_id = ${testAppId}
      AND event = 'session_start'
    `;
    
    const viewResult = await sql`
      SELECT sessions7d FROM analytics_week
      WHERE app_id = ${testAppId}
    `;
    
    // Total count should be greater than sessions7d
    const totalCount = Number(rawCount.rows[0].count);
    const sessionsCount = Number(viewResult.rows[0].sessions7d);
    
    expect(totalCount).toBeGreaterThan(sessionsCount);
  });
});