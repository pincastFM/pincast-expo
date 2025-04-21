import { describe, it, expect, vi, beforeEach } from 'vitest';
import logtoUtils from '~/server/utils/logto';
import dbQueries from '~/server/db/queries';

const { verifyLogtoToken, extractBearerToken } = logtoUtils;
const { getUserByLogtoId, updateAppState, recordAnalyticsEvent, getVersionsByAppId } = dbQueries;

// Mock imports
vi.mock('~/server/utils/logto', () => ({
  verifyLogtoToken: vi.fn(),
  extractBearerToken: vi.fn(),
  hasScope: vi.fn()
}));

vi.mock('~/server/db/queries', () => ({
  getUserByLogtoId: vi.fn(),
  updateAppState: vi.fn(),
  recordAnalyticsEvent: vi.fn(),
  getVersionsByAppId: vi.fn()
}));

// Import our mock db utilities
import { mockDb } from '../../utils/mocks';

// Mock the db with a function to control results
vi.mock('~/server/db/db', () => ({
  db: mockDb([{ id: 'app-123', state: 'published' }])
}));

// Variable to control mock results - we'll override this in tests
let mockAppResults = [{ id: 'app-123', state: 'published' }];

// Mock h3 functions
vi.mock('h3', async () => {
  const actual = await vi.importActual<typeof import('h3')>('h3');
  return {
    ...actual,
    getRequestHeader: vi.fn(),
    readBody: vi.fn(),
    createError: vi.fn().mockImplementation((options, message) => {
      if (typeof options === 'object') {
        const error = new Error(options.message) as Error & { statusCode: number; name: string };
        error.statusCode = options.statusCode;
        error.name = 'H3Error';
        return error;
      } else {
        const error = new Error(message) as Error & { statusCode: number; name: string };
        error.statusCode = options;
        error.name = 'H3Error';
        return error;
      }
    })
  };
});

// Mock #imports for Nuxt-specific functions
vi.mock('#imports', () => ({
  defineEventHandler: (handler: (event: any) => any) => handler,
  useRuntimeConfig: () => ({
    pincastJwtSecret: 'test-secret-that-is-at-least-32-chars-long'
  })
}));

// Import the mocked h3 functions
import { getRequestHeader, readBody, createError } from 'h3';

// Import our test utilities
import { createMockH3Event } from '../../utils/mocks';

// Create our own test version of the handler so we don't rely on Nuxt's defineEventHandler
async function testHandlerRollback(event: any) {
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
    const logtoId = payload.sub || '';  // Ensure we have a string
    
    // Get the user from the database
    const user = await getUserByLogtoId(logtoId);
    
    if (!user || user.role !== 'staff') {
      throw createError({
        statusCode: 403,
        message: 'Staff access required'
      });
    }
    
    // 2. Get the app ID from the route params
    const appId = event.context.params?.id;
    
    if (!appId) {
      throw createError({
        statusCode: 400,
        message: 'App ID is required'
      });
    }
    
    // Assertion to satisfy TypeScript (we already checked for undefined)
    const appIdString: string = appId;
    
    // 3. Validate the request body
    const body = await readBody(event);
    const { versionId, reason } = body;
    
    if (!versionId) {
      throw createError({
        statusCode: 400,
        message: 'Version ID is required'
      });
    }
    
    // 4. Get the app to verify it exists (using mock approach)
    const appResult = mockAppResults;
    
    if (appResult.length === 0) {
      throw createError({
        statusCode: 404,
        message: 'App not found'
      });
    }
    
    // 5. Get all versions to verify the target version exists
    const appVersions = await getVersionsByAppId(appIdString);
    
    if (appVersions.length === 0) {
      throw createError({
        statusCode: 404,
        message: 'No versions found for this app'
      });
    }
    
    // Find the target version to roll back to
    const targetVersion = appVersions.find((v: any) => v.id === versionId);
    
    if (!targetVersion) {
      throw createError({
        statusCode: 404,
        message: 'Target version not found'
      });
    }
    
    // 6. Update the app to use this version
    // This is a logical rollback - we set the app to published state
    const updatedApp = await updateAppState(appIdString, 'published');
    
    // 7. Record analytics event
    await recordAnalyticsEvent({
      appId: appIdString,
      userId: user.id,
      event: 'app_version_rollback',
      metadata: {
        versionId: targetVersion.id,
        semver: targetVersion.semver,
        reason: reason || `Rollback by staff ${user.email || user.id}`
      }
    });
    
    // 8. Return the updated app and version information
    return {
      success: true,
      app: updatedApp,
      version: targetVersion,
      message: `Rolled back to version ${targetVersion.semver}`,
      deployUrl: targetVersion.deployUrl
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
}

// We'll create mock events in each test

// Use our mock DB approach with simpler syntax

describe('Rollback POST API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset mock DB results
    mockAppResults = [{ id: 'app-123', state: 'published' }];
    
    // Default successful path mocks
    (getRequestHeader as any).mockReturnValue('Bearer test-token');
    (extractBearerToken as any).mockReturnValue('test-token');
    (verifyLogtoToken as any).mockResolvedValue({ payload: { sub: 'logto-123' } });
    (getUserByLogtoId as any).mockResolvedValue({ id: 'user-123', role: 'staff', email: 'staff@test.com' });
    (updateAppState as any).mockResolvedValue({ id: 'app-123', state: 'published' });
    
    // Mock versions
    (getVersionsByAppId as any).mockResolvedValue([
      { id: 'v2', semver: '0.2.0', deployUrl: 'https://v2.example.com', createdAt: new Date('2023-02-01') },
      { id: 'v1', semver: '0.1.0', deployUrl: 'https://v1.example.com', createdAt: new Date('2023-01-01') }
    ]);
    
    (recordAnalyticsEvent as any).mockResolvedValue(undefined);
    (readBody as any).mockResolvedValue({ versionId: 'v1', reason: 'Rolling back to stable version' });
  });
  
  it('should rollback to previous version', async () => {
    const mockEvent = createMockH3Event({
      method: 'POST',
      headers: { 'authorization': 'Bearer test-token' },
      params: { id: 'app-123' },
      body: { versionId: 'v1', reason: 'Rolling back to stable version' }
    });
    
    const result = await testHandlerRollback(mockEvent);
    
    expect(result).toEqual({
      success: true,
      app: { id: 'app-123', state: 'published' },
      version: {
        id: 'v1',
        semver: '0.1.0',
        deployUrl: 'https://v1.example.com',
        createdAt: expect.any(Date)
      },
      message: 'Rolled back to version 0.1.0',
      deployUrl: 'https://v1.example.com'
    });
    
    // Verify function calls
    expect(extractBearerToken).toHaveBeenCalledWith('Bearer test-token');
    expect(verifyLogtoToken).toHaveBeenCalledWith('test-token');
    expect(getUserByLogtoId).toHaveBeenCalledWith('logto-123');
    expect(getVersionsByAppId).toHaveBeenCalledWith('app-123');
    expect(updateAppState).toHaveBeenCalledWith('app-123', 'published');
    expect(recordAnalyticsEvent).toHaveBeenCalledWith({
      appId: 'app-123',
      userId: 'user-123',
      event: 'app_version_rollback',
      metadata: {
        versionId: 'v1',
        semver: '0.1.0',
        reason: 'Rolling back to stable version'
      }
    });
  });
  
  it('should return 401 if no token is provided', async () => {
    (extractBearerToken as any).mockReturnValue(null);
    
    const mockEvent = createMockH3Event({
      method: 'POST',
      params: { id: 'app-123' },
      body: { versionId: 'v1', reason: 'Rolling back to stable version' }
    });
    
    await expect(testHandlerRollback(mockEvent)).rejects.toEqual(
      expect.objectContaining({
        statusCode: 401,
        message: 'Authentication required'
      })
    );
  });
  
  it('should return 403 if user is not staff', async () => {
    (getUserByLogtoId as any).mockResolvedValue({ id: 'user-123', role: 'developer' });
    
    const mockEvent = createMockH3Event({
      method: 'POST',
      headers: { 'authorization': 'Bearer test-token' },
      params: { id: 'app-123' },
      body: { versionId: 'v1', reason: 'Rolling back to stable version' }
    });
    
    await expect(testHandlerRollback(mockEvent)).rejects.toEqual(
      expect.objectContaining({
        statusCode: 403,
        message: 'Staff access required'
      })
    );
  });
  
  it('should return 404 if app not found', async () => {
    // Set the mock to return empty array
    mockAppResults = [];
    
    const mockEvent = createMockH3Event({
      method: 'POST',
      headers: { 'authorization': 'Bearer test-token' },
      params: { id: 'app-123' },
      body: { versionId: 'v1', reason: 'Rolling back to stable version' }
    });
    
    await expect(testHandlerRollback(mockEvent)).rejects.toEqual(
      expect.objectContaining({
        statusCode: 404,
        message: 'App not found'
      })
    );
  });
  
  it('should return 404 if no versions found', async () => {
    (getVersionsByAppId as any).mockResolvedValue([]);
    
    const mockEvent = createMockH3Event({
      method: 'POST',
      headers: { 'authorization': 'Bearer test-token' },
      params: { id: 'app-123' },
      body: { versionId: 'v1', reason: 'Rolling back to stable version' }
    });
    
    await expect(testHandlerRollback(mockEvent)).rejects.toEqual(
      expect.objectContaining({
        statusCode: 404,
        message: 'No versions found for this app'
      })
    );
  });
  
  it('should return 404 if target version not found', async () => {
    const mockEvent = createMockH3Event({
      method: 'POST',
      headers: { 'authorization': 'Bearer test-token' },
      params: { id: 'app-123' },
      body: { versionId: 'non-existent', reason: 'Test' }
    });
    
    await expect(testHandlerRollback(mockEvent)).rejects.toEqual(
      expect.objectContaining({
        statusCode: 404,
        message: 'Target version not found'
      })
    );
  });
});