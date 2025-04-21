import { sql } from '@vercel/postgres';
import { verifyLogtoToken, extractBearerToken } from '../../utils/logto';
import { getUserByLogtoId } from '../../db/queries';
import { assertString } from '../../utils/runtime';

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
    
    // 2. Fetch pending and hidden apps
    // Since we're using Drizzle ORM with limited typing (from schema.ts),
    // we'll use a SQL query for better control over joins and result structure
    const pendingQuery = sql`
      SELECT 
        a.id, a.title, a.slug, a.hero_url AS "heroUrl", 
        a.state, a.created_at AS "createdAt", a.is_paid AS "isPaid", 
        a.price_cents AS "priceCents", a.category,
        json_build_object(
          'id', u.id,
          'email', u.email
        ) AS owner,
        (
          SELECT json_build_object(
            'id', v.id,
            'semver', v.semver,
            'deployUrl', v.deploy_url,
            'lighthouseScore', v.lighthouse_score,
            'createdAt', v.created_at
          )
          FROM versions v
          WHERE v.app_id = a.id
          ORDER BY v.created_at DESC
          LIMIT 1
        ) AS "latestVersion"
      FROM 
        apps a
      LEFT JOIN 
        users u ON a.owner_id = u.id
      WHERE 
        a.state = 'pending'
      ORDER BY 
        a.created_at DESC
    `;
    
    const hiddenQuery = sql`
      SELECT 
        a.id, a.title, a.slug, a.hero_url AS "heroUrl", 
        a.state, a.created_at AS "createdAt", a.is_paid AS "isPaid", 
        a.price_cents AS "priceCents", a.category,
        json_build_object(
          'id', u.id,
          'email', u.email
        ) AS owner,
        (
          SELECT json_build_object(
            'id', v.id,
            'semver', v.semver,
            'deployUrl', v.deploy_url,
            'lighthouseScore', v.lighthouse_score,
            'createdAt', v.created_at
          )
          FROM versions v
          WHERE v.app_id = a.id
          ORDER BY v.created_at DESC
          LIMIT 1
        ) AS "latestVersion"
      FROM 
        apps a
      LEFT JOIN 
        users u ON a.owner_id = u.id
      WHERE 
        a.state = 'hidden'
      ORDER BY 
        a.created_at DESC
    `;
    
    const [pendingResult, hiddenResult] = await Promise.all([
      pendingQuery,
      hiddenQuery
    ]);
    
    return {
      pending: pendingResult.rows,
      hidden: hiddenResult.rows
    };
  } catch (error: any) {
    // Pass through HTTP errors
    if (error.statusCode) {
      throw error;
    }
    
    // Log unexpected errors
    console.error('Error fetching review list:', error);
    
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch review list'
    });
  }
});