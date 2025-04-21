import { z } from 'zod';
import runtime from '~/server/utils/runtime';

const { assertString, assertDefined } = runtime;
import { verifyLogtoToken, extractBearerToken } from '../../../utils/logto';
import { getUserByLogtoId, updateAppState, recordAnalyticsEvent } from '../../../db/queries';
import { db } from '../../../db/db';
import { apps } from '../../../db/schema';
import { eq } from 'drizzle-orm';

// Define the request schema
const updateStateSchema = z.object({
  state: z.enum(['pending', 'published', 'rejected', 'hidden']),
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
    const { state, reason } = updateStateSchema.parse(body);
    
    // 4. Get the current app to check state transition validity
    const appResult = await db.select().from(apps).where(eq(apps.id as any, appId));
    
    if (appResult.length === 0) {
      throw createError({
        statusCode: 404,
        message: 'App not found'
      });
    }
    
    const app = assertDefined(appResult[0], 'App not found');
    
    // 5. Validate state transitions
    const currentState = assertString(app.state, 'Invalid app state');
    
    // Only certain transitions are allowed:
    // - pending → published or rejected
    // - published → hidden
    // - hidden → published
    const validTransitions: Record<string, string[]> = {
      'pending': ['published', 'rejected'],
      'published': ['hidden'],
      'hidden': ['published'],
      'rejected': ['pending'] // Allow reconsidering rejected apps
    };
    
    if (!validTransitions[currentState]?.includes(state)) {
      throw createError({
        statusCode: 400,
        message: `Invalid state transition from '${currentState}' to '${state}'`
      });
    }
    
    // 6. Update the app state
    const updatedApp = await updateAppState(appId, state);
    
    // 7. Record analytics event
    await recordAnalyticsEvent({
      appId,
      userId: user.id,
      event: 'app_state_change',
      metadata: {
        fromState: currentState,
        toState: state,
        reason: reason || `Changed by staff ${user.email || user.id}`
      }
    });
    
    // 8. Return the updated app
    return {
      success: true,
      app: updatedApp,
      message: `App state changed from '${currentState}' to '${state}'`
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
    console.error('Error updating app state:', error);
    
    throw createError({
      statusCode: 500,
      message: 'Failed to update app state'
    });
  }
});