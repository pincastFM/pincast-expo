import { defineEventHandler } from 'h3';
import { sql } from '@vercel/postgres';

/**
 * Refreshes the analytics_week materialized view
 * This endpoint is called by a scheduled cron job (every 15 minutes)
 */
export default defineEventHandler(async (_event) => {
  // Check for authorization if needed in production
  // This could use a secret token, but we're skipping that for now as Vercel Cron
  // handles the security by only allowing Vercel to trigger this endpoint
  
  try {
    // Start timestamp for measuring performance
    const startTime = Date.now();
    
    // Execute the SQL function to refresh the materialized view
    await sql`SELECT refresh_analytics_week()`;
    
    // Calculate execution time
    const duration = Date.now() - startTime;
    
    // Return success with timing information
    return {
      success: true,
      message: 'Analytics materialized view refreshed successfully',
      timestamp: new Date().toISOString(),
      duration: `${duration}ms`
    };
  } catch (error) {
    console.error('Failed to refresh analytics materialized view:', error);
    
    // Return error details
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    };
  }
});