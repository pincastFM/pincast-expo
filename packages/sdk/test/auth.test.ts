import { describe, it, expect, vi, beforeEach } from 'vitest';
import { usePincastAuth, initAuth } from '../src/composables/usePincastAuth';

// Mock Logto instance
const createMockLogto = (authenticated = true) => {
  return {
    isAuthenticated: vi.fn().mockResolvedValue(authenticated),
    getIdTokenClaims: vi.fn().mockResolvedValue(
      authenticated
        ? {
            sub: 'test-user-id',
            email: 'test@example.com',
            role: 'developer'
          }
        : null
    ),
    getAccessToken: vi.fn().mockResolvedValue(authenticated ? 'mock-token' : null),
    signIn: vi.fn().mockResolvedValue(undefined),
    signOut: vi.fn().mockResolvedValue(undefined)
  };
};

// Mock Nuxt app
const createMockNuxtApp = (logto: any) => {
  return {
    $logto: logto
  };
};

describe('usePincastAuth composable', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should initialize properly', () => {
    const mockLogto = createMockLogto();
    const mockNuxtApp = createMockNuxtApp(mockLogto);
    
    initAuth(mockLogto, mockNuxtApp);
    const auth = usePincastAuth();
    
    expect(auth.signIn).toBeDefined();
    expect(auth.signOut).toBeDefined();
    expect(auth.getToken).toBeDefined();
    expect(auth.getSession).toBeDefined();
  });

  it('should return default session when not authenticated', async () => {
    const mockLogto = createMockLogto(false);
    const mockNuxtApp = createMockNuxtApp(mockLogto);
    
    initAuth(mockLogto, mockNuxtApp);
    const auth = usePincastAuth();
    
    const session = await auth.getSession();
    
    expect(session.isAuthenticated).toBe(false);
    expect(session.id).toBe('');
    expect(session.role).toBe('player'); // Default role
  });

  it('should get user session when authenticated', async () => {
    const mockLogto = createMockLogto(true);
    const mockNuxtApp = createMockNuxtApp(mockLogto);
    
    initAuth(mockLogto, mockNuxtApp);
    const auth = usePincastAuth();
    
    const session = await auth.getSession();
    
    expect(session.isAuthenticated).toBe(true);
    expect(session.id).toBe('test-user-id');
    expect(session.email).toBe('test@example.com');
    expect(session.role).toBe('developer');
  });

  it('should call Logto signIn with correct parameters', async () => {
    const mockLogto = createMockLogto();
    const mockNuxtApp = createMockNuxtApp(mockLogto);
    
    initAuth(mockLogto, mockNuxtApp);
    const auth = usePincastAuth();
    
    await auth.signIn({ redirectUri: 'https://example.com/callback' });
    
    expect(mockLogto.signIn).toHaveBeenCalledWith({ redirectUri: 'https://example.com/callback' });
  });

  it('should call Logto signOut with correct parameters', async () => {
    const mockLogto = createMockLogto();
    const mockNuxtApp = createMockNuxtApp(mockLogto);
    
    initAuth(mockLogto, mockNuxtApp);
    const auth = usePincastAuth();
    
    await auth.signOut({ postLogoutRedirectUri: 'https://example.com' });
    
    expect(mockLogto.signOut).toHaveBeenCalledWith({ postLogoutRedirectUri: 'https://example.com' });
  });

  it('should get token from Logto', async () => {
    const mockLogto = createMockLogto();
    const mockNuxtApp = createMockNuxtApp(mockLogto);
    
    initAuth(mockLogto, mockNuxtApp);
    const auth = usePincastAuth();
    
    const token = await auth.getToken();
    
    expect(token).toBe('mock-token');
    expect(mockLogto.getAccessToken).toHaveBeenCalled();
  });

  it('should handle missing Logto instance gracefully', async () => {
    initAuth(null, null);
    const auth = usePincastAuth();
    
    const session = await auth.getSession();
    const token = await auth.getToken();
    
    expect(session.isAuthenticated).toBe(false);
    expect(session.role).toBe('player');
    expect(token).toBeNull();
    
    // These should throw
    await expect(auth.signIn()).rejects.toThrow();
    await expect(auth.signOut()).rejects.toThrow();
  });
});