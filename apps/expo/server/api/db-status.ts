import { checkPostGIS } from '../db/db';

export default defineEventHandler(async () => {
  try {
    // Check database connection
    const hasPostGIS = await checkPostGIS();
    
    return {
      status: 'ok',
      postgis: hasPostGIS ? 'available' : 'unavailable',
      message: 'Database connection successful'
    };
  } catch (error: any) {
    console.error('Database check failed:', error);
    
    return {
      status: 'error',
      message: 'Database connection failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    };
  }
});