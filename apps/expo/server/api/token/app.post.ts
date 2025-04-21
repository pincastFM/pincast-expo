import { z } from 'zod';
import { verifyLogtoToken } from '../../utils/logto';
import { signJwt } from '../../utils/jwt';
import { getUserByLogtoId } from '../../db/queries';
import { db } from '../../db/db';
import { eq } from 'drizzle-orm';
import { apps } from '../../db/schema';
import { assertString } from '../../utils/runtime';

// Define the request schema using Zod
const appTokenRequestSchema = z.object({
  idToken: z.string(),
  appId: z.string().uuid()
});

export default defineEventHandler(async (event) => {
  try {
    // 1. Parse and validate the request body
    const body = await readBody(event);
    const validatedData = appTokenRequestSchema.parse(body);
    
    // 2. Verify the Logto ID token
    const { payload } = await verifyLogtoToken(validatedData.idToken);
    const playerId = assertString(payload.sub, 'Invalid token: missing subject ID');
    
    // 3. Get the player from the database
    const player = await getUserByLogtoId(playerId);
    
    if (!player) {
      throw createError({
        statusCode: 403,
        message: 'Player account not found'
      });
    }
    
    // 4. Verify that the app exists and is published
    const appResult = await db.select()
      .from(apps)
      .where(eq(apps.id as any, validatedData.appId));
    
    const app = appResult[0];
    
    if (!app) {
      throw createError({
        statusCode: 404,
        message: 'App not found'
      });
    }
    
    if (app.state !== 'published') {
      throw createError({
        statusCode: 403,
        message: 'App is not published'
      });
    }
    
    // 5. Issue the app token
    const appToken = await signJwt({
      sub: player.id,
      appId: validatedData.appId,
      aud: `app:${validatedData.appId}`,
      role: 'player'
    }, '1h');
    
    // 6. Return the token
    return {
      token: appToken,
      expiresIn: 3600
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
    console.error('Error issuing app token:', error);
    
    throw createError({
      statusCode: 500,
      message: 'Internal server error'
    });
  }
});