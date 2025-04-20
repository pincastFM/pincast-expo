import { describe, it, expect, vi, beforeEach } from 'vitest';
import { verifyLogtoToken } from '../../../server/utils/logto';
import { signJwt } from '../../../server/utils/jwt';
import { getUserByLogtoId } from '../../../server/db/queries';
// DB is mocked separately

// Mock the dependencies
vi.mock('../../../server/utils/logto', () => ({
  verifyLogtoToken: vi.fn()
}));

vi.mock('../../../server/utils/jwt', () => ({
  signJwt: vi.fn()
}));

vi.mock('../../../server/db/queries', () => ({
  getUserByLogtoId: vi.fn()
}));

import { mockDb } from '../../utils/mocks';

vi.mock('../../../server/db/db', () => ({
  db: mockDb([{
    id: '12345678-1234-1234-1234-123456789012',
    state: 'published'
  }])
}));

// Mock H3 functions
vi.mock('h3', () => ({
  readBody: vi.fn(),
  createError: vi.fn((opts) => ({ ...opts, name: 'H3Error' })),
  createEvent: vi.fn(() => ({
    node: { req: {}, res: {} },
    context: {}
  }))
}));

// Import our testing utilities
import { createMockH3Event } from '../../utils/mocks';

// Import the endpoint handler
import appTokenHandler from '../../../server/api/token/app.post';

// Mock readBody
import { readBody } from 'h3';

describe('App Token POST Endpoint', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mocks for valid flow
    (readBody as any).mockResolvedValue({
      idToken: 'test-id-token',
      appId: '12345678-1234-1234-1234-123456789012'
    });
    
    (verifyLogtoToken as any).mockResolvedValue({
      payload: { sub: 'logto-123' }
    });
    
    (getUserByLogtoId as any).mockResolvedValue({
      id: 'player-123',
      logtoId: 'logto-123',
      role: 'player'
    });
    
    (signJwt as any).mockResolvedValue('signed-app-token');
  });
  
  it('should issue an app token successfully', async () => {
    // Create a proper mock event
    const mockEvent = createMockH3Event({
      method: 'POST',
      body: {
        idToken: 'test-id-token',
        appId: '12345678-1234-1234-1234-123456789012'
      }
    });
    
    const result = await appTokenHandler(mockEvent);
    
    // Check the result
    expect(result).toEqual({
      token: 'signed-app-token',
      expiresIn: 3600
    });
    
    // Verify function calls
    expect(verifyLogtoToken).toHaveBeenCalledWith('test-id-token');
    expect(getUserByLogtoId).toHaveBeenCalledWith('logto-123');
    expect(signJwt).toHaveBeenCalledWith(
      {
        sub: 'player-123',
        appId: '12345678-1234-1234-1234-123456789012',
        aud: 'app:12345678-1234-1234-1234-123456789012',
        role: 'player'
      },
      '1h'
    );
  });
  
  it('should return 400 if request is invalid', async () => {
    // Create a proper mock event with invalid body
    const mockEvent = createMockH3Event({
      method: 'POST',
      body: {
        // Missing required fields
      }
    });
    
    const error = {
      statusCode: 400,
      message: 'Invalid request data'
    };
    
    const result = await appTokenHandler(mockEvent);
    expect(result).toEqual(expect.objectContaining(error));
  });
  
  it('should return 403 if player not found', async () => {
    (getUserByLogtoId as any).mockResolvedValue(null);
    
    const mockEvent = createMockH3Event({
      method: 'POST',
      body: {
        idToken: 'test-id-token',
        appId: '12345678-1234-1234-1234-123456789012'
      }
    });
    
    await expect(appTokenHandler(mockEvent)).rejects.toEqual(
      expect.objectContaining({
        statusCode: 403,
        message: 'Player account not found'
      })
    );
  });
  
  it('should return 404 if app not found', async () => {
    // Override the mockDb with empty results for this test
    vi.mocked(mockDb([]).select().from().where).mockResolvedValue([]);
    
    const mockEvent = createMockH3Event({
      method: 'POST',
      body: {
        idToken: 'test-id-token',
        appId: '12345678-1234-1234-1234-123456789012'
      }
    });
    
    await expect(appTokenHandler(mockEvent)).rejects.toEqual(
      expect.objectContaining({
        statusCode: 404,
        message: 'App not found'
      })
    );
  });
  
  it('should return 403 if app is not published', async () => {
    // Override the mockDb with pending app for this test
    vi.mocked(mockDb([{
      id: '12345678-1234-1234-1234-123456789012',
      state: 'pending'
    }]).select().from().where).mockResolvedValue([{
      id: '12345678-1234-1234-1234-123456789012',
      state: 'pending'
    }]);
    
    const mockEvent = createMockH3Event({
      method: 'POST',
      body: {
        idToken: 'test-id-token',
        appId: '12345678-1234-1234-1234-123456789012'
      }
    });
    
    await expect(appTokenHandler(mockEvent)).rejects.toEqual(
      expect.objectContaining({
        statusCode: 403,
        message: 'App is not published'
      })
    );
  });
});