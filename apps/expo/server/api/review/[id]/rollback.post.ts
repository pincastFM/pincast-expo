import { z } from 'zod';
import runtime from '~/server/utils/runtime';

const { assertString, assertDefined } = runtime;
import { verifyLogtoToken, extractBearerToken } from '../../../utils/logto';
import { getUserByLogtoId, updateAppState, recordAnalyticsEvent, getVersionsByAppId } from '../../../db/queries';
import { db } from '../../../db/db';
import { apps } from '../../../db/schema';
import { eq } from 'drizzle-orm';

// Define the request schema
const rollbackSchema = z.object({
  versionId: z.string().uuid(),
  reason: z.string().optional()
});

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
    
    // 3. Validate the request body
    const body = await readBody(event);
    const { versionId, reason } = rollbackSchema.parse(body);
    
    // 4. Get the app to verify it exists
    const appResult = await db.select().from(apps).where(eq(apps.id as any, appId));
    
    if (appResult.length === 0) {
      throw createError({
        statusCode: 404,
        message: 'App not found'
      });
    }
    
    // 5. Get all versions to verify the target version exists
    const appVersions = await getVersionsByAppId(appId);
    
    if (appVersions.length === 0) {
      throw createError({
        statusCode: 404,
        message: 'No versions found for this app'
      });
    }
    
    // Find the target version to roll back to
    const targetVersion = appVersions.find(v => v.id === versionId);
    
    // Ensure target version exists
    const foundVersion = assertDefined(
      targetVersion,
      'Target version not found'
    );
    
    // 6. Update the app to use this version
    // This is a logical rollback - we set the app to published state
    const updatedApp = await updateAppState(appId, 'published');
    
    // 7. Record analytics event
    await recordAnalyticsEvent({
      appId,
      userId: user.id,
      event: 'app_version_rollback',
      metadata: {
        versionId: foundVersion.id,
        semver: foundVersion.semver,
        reason: reason || `Rollback by staff ${user.email || user.id}`
      }
    });
    
    // 8. Return the updated app and version information
    return {
      success: true,
      app: updatedApp,
      version: foundVersion,
      message: `Rolled back to version ${foundVersion.semver}`,
      deployUrl: foundVersion.deployUrl || ''
    };
  } catch (error: any) {
    // Handle validation errors
    if (error.name === 'ZodError') {
      return createError({
        statusCode: 400,
        message: 'Invalid request data',
        data: error.errors
      });
    }
    
    // Pass through HTTP errors
    if (error.statusCode) {
      throw error;
    }
    
    // Log unexpected errors
    console.error('Error rolling back version:', error);
    
    throw createError({
      statusCode: 500,
      message: 'Failed to rollback version'
    });
  }
});