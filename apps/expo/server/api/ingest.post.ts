import { defineEventHandler, readBody, getRequestHeader, H3Event } from 'h3';
import { z } from 'zod';
import { decodeJwt, verifyJwt } from '~/server/utils/jwt';
import { recordAnalyticsEvent } from '~/server/db/queries';

// Event validation schema
const analyticsEventSchema = z.object({
  event: z.string().min(1).max(255),
  payload: z.record(z.any()).optional()
});

/**
 * Processes a JWT token to verify app-specific authentication
 * @param token The JWT token
 * @returns The app ID from the token audience if valid
 */
async function processToken(token: string | null): Promise<string> {
  if (!token) {
    throw createHttpError(401, 'Authentication token is required');
  }

  try {
    // Verify the token
    const payload = await verifyJwt(token);
    
    // Check token audience format: aud=app:{id}
    const audienceStr = Array.isArray(payload.aud) ? payload.aud[0] : payload.aud;
    if (!audienceStr || typeof audienceStr !== 'string') {
      throw createHttpError(401, 'Invalid token audience');
    }
    
    const audienceMatch = audienceStr.match(/^app:([a-f0-9-]+)$/i);
    if (!audienceMatch || !audienceMatch[1]) {
      throw createHttpError(401, 'Token not authorized for app access');
    }
    
    // Extract app ID from audience
    return audienceMatch[1];
  } catch (error) {
    console.error('JWT validation error:', error);
    throw createHttpError(401, 'Invalid or expired token');
  }
}

/**
 * Extracts bearer token from Authorization header
 */
function getBearerToken(event: H3Event): string | null {
  const authHeader = getRequestHeader(event, 'Authorization');
  if (!authHeader) return null;
  
  const matches = authHeader.match(/^Bearer\s+(.*)$/i);
  if (!matches || !matches[1]) return null;
  
  return matches[1];
}

/**
 * Creates an HTTP error with status code
 */
function createHttpError(statusCode: number, message: string): Error & { statusCode: number } {
  const error = new Error(message) as Error & { statusCode: number };
  error.statusCode = statusCode;
  return error;
}

/**
 * Analytics ingestion endpoint
 * Accepts JWT with aud=app:{id} and event data
 */
export default defineEventHandler(async (event) => {
  try {
    // Get and validate token
    const token = getBearerToken(event);
    const appId = await processToken(token);
    
    // Decode token to get user ID
    const decodedToken = decodeJwt(token!);
    const userId = decodedToken.sub;
    
    if (!userId) {
      throw createHttpError(400, 'User ID not found in token');
    }
    
    // Read and validate request body
    const body = await readBody(event);
    const validatedBody = analyticsEventSchema.parse(body);
    
    // Get current timestamp
    const timestamp = new Date();
    
    // Record the analytics event
    await recordAnalyticsEvent({
      appId,
      userId,
      event: validatedBody.event,
      ts: timestamp,
      metadata: validatedBody.payload
    });
    
    return { success: true, timestamp: timestamp.toISOString() };
  } catch (error) {
    console.error('Analytics ingestion error:', error);
    
    // Handle validation errors
    if (error instanceof z.ZodError) {
      throw createHttpError(400, `Validation error: ${error.errors[0]?.message || 'Invalid data format'}`);
    }
    
    // Re-throw HTTP errors
    if ((error as any).statusCode) {
      throw error;
    }
    
    // Default error
    throw createHttpError(500, 'Failed to process analytics event');
  }
});