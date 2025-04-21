import { sql } from '@vercel/postgres';
import { assertString } from '~/server/utils/runtime';
import { verifyLogtoToken, extractBearerToken } from '../../utils/logto';
import { getUserByLogtoId } from '../../db/queries';

export default defineEventHandler(async (event) => {
  try {
    // 1. Verify staff authentication
    const authHeader = getRequestHeader(event, 'authorization');
    const token = extractBearerToken(authHeader);
    
    if (!token) {
      throw createError({
        statusCode: 401,
        message: 'Authentication required'
      });
    }
    
    // Verify the token is valid
    const { payload } = await verifyLogtoToken(token);
    const logtoId = assertString(payload.sub, 'Invalid token: missing subject ID');
    
    // Get the user from the database
    const user = await getUserByLogtoId(logtoId);
    
    if (!user || user.role !== 'staff') {
      throw createError({
        statusCode: 403,
        message: 'Staff access required'
      });
    }
    
    // 2. Get the app ID from the route params and assert it's present
    const appId = assertString(
      event.context.params?.id,
      'App ID is required'
    );
    
    // 3. Fetch the app details with owner and versions
    const appQuery = sql`
      SELECT 
        a.id, a.title, a.slug, a.hero_url AS "heroUrl", 
        a.state, a.created_at AS "createdAt", a.is_paid AS "isPaid", 
        a.price_cents AS "priceCents", a.category, a.geo_area AS "geoArea",
        json_build_object(
          'id', u.id,
          'email', u.email
        ) AS owner,
        (
          SELECT json_agg(
            json_build_object(
              'id', v.id,
              'semver', v.semver,
              'deployUrl', v.deploy_url,
              'changelog', v.changelog,
              'lighthouseScore', v.lighthouse_score,
              'repoUrl', v.repo_url,
              'createdAt', v.created_at
            )
            ORDER BY v.created_at DESC
          )
          FROM versions v
          WHERE v.app_id = a.id
        ) AS versions
      FROM 
        apps a
      LEFT JOIN 
        users u ON a.owner_id = u.id
      WHERE 
        a.id = ${appId}
    `;
    
    const result = await appQuery;
    
    if (result.rows.length === 0) {
      throw createError({
        statusCode: 404,
        message: 'App not found'
      });
    }
    
    const app = result.rows[0];
    
    // Ensure versions is an array, not null
    if (!app.versions) {
      app.versions = [];
    }
    
    return app;
  } catch (error: any) {
    // Pass through HTTP errors
    if (error.statusCode) {
      throw error;
    }
    
    // Log unexpected errors
    console.error('Error fetching app details:', error);
    
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch app details'
    });
  }
});