import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ref } from 'vue';
import { usePlayerToken } from '~/composables/usePlayerToken';

// Mock cookie store
const cookieStore: Record<string, any> = {};

// Mock the necessary Nuxt dependencies
vi.mock('nuxt/app', () => ({
  useCookie: (name: string) => {
    // Create reactive reference that updates the cookieStore when changed
    const value = ref(cookieStore[name] || null);
    
    // Watch for changes to update the store
    vi.fn().mockImplementation((newValue: any) => {
      cookieStore[name] = newValue;
      value.value = newValue;
    });
    
    return value;
  }
}));

vi.mock('@logto/nuxt', () => ({
  useLogto: () => ({
    isAuthenticated: { value: true },
    signIn: vi.fn().mockResolvedValue(undefined),
    getIdToken: vi.fn().mockResolvedValue('mock-id-token')
  })
}));

// Mock the fetch function
// Note the global fetch is defined but $fetch isn't
// @ts-ignore - Mock fetch function for testing
window.$fetch = vi.fn().mockImplementation((url: string, options: any) => {
  if (url === '/api/token/app' && options.method === 'POST') {
    return Promise.resolve({
      token: 'mock-app-token-' + options.body.appId
    });
  }
  return Promise.reject(new Error('Unexpected fetch call'));
});

describe('usePlayerToken', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should get a token for a specific app', async () => {
    const { getPlayerToken, token } = usePlayerToken();
    
    const appId = 'test-app-123';
    const result = await getPlayerToken(appId);
    
    // Verify the token was retrieved and stored
    expect(result).toBe('mock-app-token-test-app-123');
    expect(token.value).toBe('mock-app-token-test-app-123');
  });

  it('should store token in cookie and return it from getStoredToken', async () => {
    const { getPlayerToken, getStoredToken } = usePlayerToken();
    
    // Get token for an app
    const appId = 'test-app-456';
    await getPlayerToken(appId);
    
    // Verify we can retrieve the stored token
    const storedToken = getStoredToken();
    expect(storedToken).toBe('mock-app-token-test-app-456');
  });

  it('should clear the token when clearToken is called', async () => {
    const { getPlayerToken, clearToken, getStoredToken } = usePlayerToken();
    
    // Get token and verify it exists
    const appId = 'test-app-789';
    await getPlayerToken(appId);
    expect(getStoredToken()).toBe('mock-app-token-test-app-789');
    
    // Clear the token
    clearToken();
    
    // Verify the token is cleared
    expect(getStoredToken()).toBeNull();
  });
});