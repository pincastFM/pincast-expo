import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createApp, getAppBySlug, createVersion, getVersionsByAppId, getUserByLogtoId } from '../../../server/db/queries';
import { verifyLogtoToken, extractBearerToken, hasScope } from '../../../server/utils/logto';

// Mock the dependencies
vi.mock('../../../server/utils/logto', () => ({
  verifyLogtoToken: vi.fn(),
  extractBearerToken: vi.fn(),
  hasScope: vi.fn()
}));

vi.mock('../../../server/db/queries', () => ({
  createApp: vi.fn(),
  getAppBySlug: vi.fn(),
  createVersion: vi.fn(),
  getVersionsByAppId: vi.fn(),
  getUserByLogtoId: vi.fn()
}));

// Mock H3 functions
vi.mock('h3', () => ({
  getRequestHeader: vi.fn(),
  readBody: vi.fn(),
  createError: vi.fn((opts) => ({ ...opts, name: 'H3Error' }))
}));

// Import the endpoint handler
import appsPostHandler from '../../../server/api/ci/apps.post';

// Import our utility for creating mock events
import { createMockH3Event } from '../../utils/mocks';

// Mock getRequestHeader and readBody
import { getRequestHeader, readBody } from 'h3';

describe('CI Apps POST Endpoint', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mocks for valid flow
    (getRequestHeader as any).mockReturnValue('Bearer test-token');
    (extractBearerToken as any).mockReturnValue('test-token');
    (verifyLogtoToken as any).mockResolvedValue({
      payload: { sub: 'logto-123', scope: 'developer:api' }
    });
    (hasScope as any).mockReturnValue(true);
    (getUserByLogtoId as any).mockResolvedValue({
      id: 'dev-123',
      logtoId: 'logto-123',
      role: 'developer'
    });
    (getAppBySlug as any).mockResolvedValue(null);
    (createApp as any).mockResolvedValue({
      id: 'app-123',
      ownerId: 'dev-123',
      state: 'pending'
    });
    (getVersionsByAppId as any).mockResolvedValue([]);
    (createVersion as any).mockResolvedValue({
      id: 'version-123',
      appId: 'app-123',
      semver: '0.1.0'
    });
    (readBody as any).mockResolvedValue({
      title: 'Test App',
      slug: 'test-app',
      geo: {
        center: [10.0, 20.0],
        radiusMeters: 1000
      },
      buildUrl: 'https://example.com/build',
      heroUrl: 'https://example.com/hero.png'
    });
  });
  
  it('should register a new app successfully', async () => {
    const mockEvent = createMockH3Event({
      method: 'POST',
      headers: { 'authorization': 'Bearer test-token' },
      body: {
        title: 'Test App',
        slug: 'test-app',
        geo: {
          center: [10.0, 20.0],
          radiusMeters: 1000
        },
        buildUrl: 'https://example.com/build',
        heroUrl: 'https://example.com/hero.png'
      }
    });
    
    const result = await appsPostHandler(mockEvent);
    
    // Check the result
    expect(result).toEqual({
      appId: 'app-123',
      versionId: 'version-123',
      dashboard: 'https://expo.pincast.fm/dashboard/apps/app-123',
      status: 'pending'
    });
    
    // Verify function calls
    expect(extractBearerToken).toHaveBeenCalledWith('Bearer test-token');
    expect(verifyLogtoToken).toHaveBeenCalledWith('test-token');
    expect(hasScope).toHaveBeenCalledWith({ sub: 'logto-123', scope: 'developer:api' }, 'developer:api');
    expect(getUserByLogtoId).toHaveBeenCalledWith('logto-123');
    expect(getAppBySlug).toHaveBeenCalledWith('test-app');
    expect(createApp).toHaveBeenCalledWith(expect.objectContaining({
      ownerId: 'dev-123',
      title: 'Test App',
      slug: 'test-app'
    }));
    expect(getVersionsByAppId).toHaveBeenCalledWith('app-123');
    expect(createVersion).toHaveBeenCalledWith({
      appId: 'app-123',
      semver: '0.1.0',
      deployUrl: 'https://example.com/build'
    });
  });
  
  it('should return 401 if no token is provided', async () => {
    (extractBearerToken as any).mockReturnValue(null);
    
    const mockEvent = createMockH3Event({
      method: 'POST',
      body: {
        title: 'Test App',
        slug: 'test-app',
        geo: { center: [10.0, 20.0], radiusMeters: 1000 },
        buildUrl: 'https://example.com/build'
      }
    });
    
    await expect(appsPostHandler(mockEvent)).rejects.toEqual(
      expect.objectContaining({
        statusCode: 401,
        message: 'Authentication required'
      })
    );
  });
  
  it('should return 403 if token does not have developer scope', async () => {
    (hasScope as any).mockReturnValue(false);
    
    const mockEvent = createMockH3Event({
      method: 'POST',
      headers: { 'authorization': 'Bearer test-token' },
      body: {
        title: 'Test App',
        slug: 'test-app',
        geo: { center: [10.0, 20.0], radiusMeters: 1000 },
        buildUrl: 'https://example.com/build'
      }
    });
    
    await expect(appsPostHandler(mockEvent)).rejects.toEqual(
      expect.objectContaining({
        statusCode: 403,
        message: 'Developer scope required'
      })
    );
  });
  
  it('should return 403 if developer not found', async () => {
    (getUserByLogtoId as any).mockResolvedValue(null);
    
    const mockEvent = createMockH3Event({
      method: 'POST',
      headers: { 'authorization': 'Bearer test-token' },
      body: {
        title: 'Test App',
        slug: 'test-app',
        geo: { center: [10.0, 20.0], radiusMeters: 1000 },
        buildUrl: 'https://example.com/build'
      }
    });
    
    await expect(appsPostHandler(mockEvent)).rejects.toEqual(
      expect.objectContaining({
        statusCode: 403,
        message: 'Developer account not found'
      })
    );
  });
  
  it('should return 409 if app slug exists and belongs to another developer', async () => {
    (getAppBySlug as any).mockResolvedValue({
      id: 'existing-app',
      ownerId: 'other-dev',
      slug: 'test-app'
    });
    
    const mockEvent = createMockH3Event({
      method: 'POST',
      headers: { 'authorization': 'Bearer test-token' },
      body: {
        title: 'Test App',
        slug: 'test-app',
        geo: { center: [10.0, 20.0], radiusMeters: 1000 },
        buildUrl: 'https://example.com/build'
      }
    });
    
    await expect(appsPostHandler(mockEvent)).rejects.toEqual(
      expect.objectContaining({
        statusCode: 409,
        message: "App with slug 'test-app' already exists"
      })
    );
  });
  
  it('should update app if it belongs to the same developer', async () => {
    const existingApp = {
      id: 'existing-app',
      ownerId: 'dev-123',
      slug: 'test-app',
      state: 'pending'
    };
    
    (getAppBySlug as any).mockResolvedValue(existingApp);
    (getVersionsByAppId as any).mockResolvedValue([
      { semver: '0.1.0', createdAt: new Date('2023-01-01') }
    ]);
    
    const mockEvent = createMockH3Event({
      method: 'POST',
      headers: { 'authorization': 'Bearer test-token' },
      body: {
        title: 'Test App',
        slug: 'test-app',
        geo: { center: [10.0, 20.0], radiusMeters: 1000 },
        buildUrl: 'https://example.com/build'
      }
    });
    
    const result = await appsPostHandler(mockEvent);
    
    // Add type check to ensure result has appId property
    if ('appId' in result) {
      expect(result.appId).toBe('existing-app');
      expect(createApp).not.toHaveBeenCalled(); // Should not create new app
    } else {
      // This should never happen, but helps TypeScript
      throw new Error('Unexpected result type');
    }
  });
  
  it('should auto-increment version number', async () => {
    (getVersionsByAppId as any).mockResolvedValue([
      { semver: '0.1.5', createdAt: new Date('2023-01-01') }
    ]);
    
    const mockEvent = createMockH3Event({
      method: 'POST',
      headers: { 'authorization': 'Bearer test-token' },
      body: {
        title: 'Test App',
        slug: 'test-app',
        geo: { center: [10.0, 20.0], radiusMeters: 1000 },
        buildUrl: 'https://example.com/build'
      }
    });
    
    await appsPostHandler(mockEvent);
    
    expect(createVersion).toHaveBeenCalledWith(expect.objectContaining({
      semver: '0.1.6'
    }));
  });
  
  it('should use provided sdkVersion if available', async () => {
    const mockEvent = createMockH3Event({
      method: 'POST',
      headers: { 'authorization': 'Bearer test-token' },
      body: {
        title: 'Test App',
        slug: 'test-app',
        geo: { center: [10.0, 20.0], radiusMeters: 1000 },
        buildUrl: 'https://example.com/build',
        sdkVersion: '1.2.3'
      }
    });
    
    await appsPostHandler(mockEvent);
    
    expect(createVersion).toHaveBeenCalledWith(expect.objectContaining({
      semver: '1.2.3'
    }));
  });
});