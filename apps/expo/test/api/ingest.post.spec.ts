import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as h3 from 'h3';
import ingestHandler from '~/server/api/ingest.post';
import * as jwt from '~/server/utils/jwt';
import * as queries from '~/server/db/queries';
import { createMockH3Event } from '~/test/utils/mocks';

// Mock dependencies
vi.mock('~/server/utils/jwt', () => ({
  verifyJwt: vi.fn(),
  decodeJwt: vi.fn()
}));

vi.mock('~/server/db/queries', () => ({
  recordAnalyticsEvent: vi.fn()
}));

// Properly mock h3 methods
vi.mock('h3', async () => {
  const actual = await vi.importActual<typeof import('h3')>('h3');
  return {
    ...actual,
    getRequestHeader: vi.fn(),
    readBody: vi.fn(),
    createError: vi.fn().mockImplementation((statusCode, message) => {
      const error = new Error(message) as Error & { statusCode: number };
      error.statusCode = statusCode;
      return error;
    })
  };
});

describe('POST /api/ingest', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should validate token and insert analytics event', async () => {
    // Arrange
    const appId = '123e4567-e89b-12d3-a456-426614174000';
    const userId = '98765432-e89b-12d3-a456-426614174000';
    
    // Setup mocks
    const eventBody = {
      event: 'test_event',
      payload: { test: 'data' }
    };
    
    // Mock readBody to return the event data
    vi.mocked(h3.readBody).mockResolvedValue(eventBody);
    
    // Mock getRequestHeader to return the authorization header
    vi.mocked(h3.getRequestHeader).mockReturnValue('Bearer valid-token');
    
    // Mock JWT verification
    vi.mocked(jwt.verifyJwt).mockResolvedValue({
      aud: `app:${appId}`,
      sub: userId
    });
    
    // Mock JWT decoding
    vi.mocked(jwt.decodeJwt).mockReturnValue({
      aud: `app:${appId}`,
      sub: userId
    });
    
    // Create H3 event with our mock req/res
    const event = createMockH3Event({
      method: 'POST',
      headers: {
        authorization: 'Bearer valid-token',
        'content-type': 'application/json'
      }
    });
    
    // Act
    const response = await ingestHandler(event);
    
    // Assert
    expect(jwt.verifyJwt).toHaveBeenCalledWith('valid-token');
    expect(queries.recordAnalyticsEvent).toHaveBeenCalledWith({
      appId,
      userId,
      event: 'test_event',
      metadata: { test: 'data' },
      ts: expect.any(Date)
    });
    expect(response).toEqual({
      success: true,
      timestamp: expect.any(String)
    });
  });

  it('should reject requests without authorization header', async () => {
    // Arrange
    // Mock getRequestHeader to return undefined (no auth header)
    vi.mocked(h3.getRequestHeader).mockReturnValue(undefined);
    
    // Create H3 event
    const event = createMockH3Event({
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      }
    });
    
    // Act & Assert
    await expect(ingestHandler(event)).rejects.toThrow('Authentication token is required');
    expect(queries.recordAnalyticsEvent).not.toHaveBeenCalled();
  });

  it('should reject invalid tokens', async () => {
    // Arrange
    // Mock getRequestHeader to return the authorization header
    vi.mocked(h3.getRequestHeader).mockReturnValue('Bearer invalid-token');
    
    // Mock JWT verification to throw error
    vi.mocked(jwt.verifyJwt).mockRejectedValue(new Error('Invalid token'));
    
    // Create H3 event
    const event = createMockH3Event({
      method: 'POST',
      headers: {
        authorization: 'Bearer invalid-token',
        'content-type': 'application/json'
      }
    });
    
    // Act & Assert
    await expect(ingestHandler(event)).rejects.toThrow('Invalid or expired token');
    expect(queries.recordAnalyticsEvent).not.toHaveBeenCalled();
  });

  it('should reject tokens with invalid audience format', async () => {
    // Arrange
    // Mock getRequestHeader to return the authorization header
    vi.mocked(h3.getRequestHeader).mockReturnValue('Bearer token-with-wrong-audience');
    
    // Mock JWT verification
    vi.mocked(jwt.verifyJwt).mockResolvedValue({
      aud: 'not-app-format',
      sub: 'user-id'
    });
    
    // Create H3 event
    const event = createMockH3Event({
      method: 'POST',
      headers: {
        authorization: 'Bearer token-with-wrong-audience',
        'content-type': 'application/json'
      }
    });
    
    // Act & Assert
    await expect(ingestHandler(event)).rejects.toThrow('Token not authorized for app access');
    expect(queries.recordAnalyticsEvent).not.toHaveBeenCalled();
  });

  it('should validate request body schema', async () => {
    // Arrange
    // Mock invalid body
    vi.mocked(h3.readBody).mockResolvedValue({
      // Missing required 'event' field
      payload: { test: 'data' }
    });
    
    // Mock getRequestHeader to return the authorization header
    vi.mocked(h3.getRequestHeader).mockReturnValue('Bearer valid-token');
    
    // Mock JWT verification
    vi.mocked(jwt.verifyJwt).mockResolvedValue({
      aud: 'app:123e4567-e89b-12d3-a456-426614174000',
      sub: 'user-id'
    });
    
    vi.mocked(jwt.decodeJwt).mockReturnValue({
      aud: 'app:123e4567-e89b-12d3-a456-426614174000',
      sub: 'user-id'
    });
    
    // Create H3 event
    const event = createMockH3Event({
      method: 'POST',
      headers: {
        authorization: 'Bearer valid-token',
        'content-type': 'application/json'
      }
    });
    
    // Act & Assert
    await expect(ingestHandler(event)).rejects.toThrow('Validation error');
    expect(queries.recordAnalyticsEvent).not.toHaveBeenCalled();
  });
});