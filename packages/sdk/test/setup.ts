// Setup file for Vitest
import { vi, beforeAll, afterEach, afterAll } from 'vitest';
import { setupServer } from 'msw/node';
import { HttpResponse, http } from 'msw';
import { initAuth } from '../src/composables/usePincastAuth';
import { initDataClient } from '../src/composables/usePincastData';
import { initAnalytics } from '../src/composables/usePincastAnalytics';

// Mock Logto instance
export const mockLogto = {
  isAuthenticated: vi.fn().mockResolvedValue(true),
  getIdTokenClaims: vi.fn().mockResolvedValue({
    sub: 'user-123',
    email: 'test@example.com',
    role: 'player'
  }),
  getAccessToken: vi.fn().mockResolvedValue('mock-token-123'),
  signIn: vi.fn().mockResolvedValue(undefined),
  signOut: vi.fn().mockResolvedValue(undefined)
};

// Mock client instance
export const mockClient = {
  collection: vi.fn().mockReturnValue({
    getAll: vi.fn().mockResolvedValue([{ id: 'item-1' }]),
    getById: vi.fn().mockResolvedValue({ id: 'item-1' }),
    create: vi.fn().mockResolvedValue({ id: 'new-item' }),
    update: vi.fn().mockResolvedValue({ id: 'updated-item' }),
    delete: vi.fn().mockResolvedValue(true),
    near: vi.fn().mockResolvedValue([{ id: 'near-item', distance: 100 }])
  })
};

// Mock analytics functions
export const mockTrack = vi.fn().mockResolvedValue(true);
export const mockIdentify = vi.fn().mockResolvedValue(true);

// Create MSW server for mocking API responses
export const server = setupServer(
  // Default handlers
  http.get('/data/:collection', () => {
    return HttpResponse.json([{ id: 'mock-item-1', name: 'Mock Item' }]);
  }),
  http.post('/data/:collection', () => {
    return HttpResponse.json({ id: 'new-item-id', success: true });
  })
);

// Setup mocks before tests
beforeAll(() => {
  // Start MSW server
  server.listen({ onUnhandledRequest: 'error' });

  // Mock Nuxt runtime config
  vi.mock('#imports', () => ({
    useRuntimeConfig: () => ({
      public: {
        pincastApi: 'https://api.pincast.fm',
      },
    }),
  }));

  // Mock window.location
  Object.defineProperty(window, 'location', {
    value: new URL('https://example.com'),
    writable: true,
  });
  
  // Mock the global navigator.geolocation
  Object.defineProperty(global, 'navigator', {
    value: {
      geolocation: {
        getCurrentPosition: vi.fn((success) => {
          success({
            coords: {
              latitude: 40.7128,
              longitude: -74.006,
              accuracy: 10
            },
            timestamp: Date.now()
          });
        }),
        watchPosition: vi.fn(),
        clearWatch: vi.fn()
      }
    },
    writable: true
  });
  
  // Initialize SDK components
  setupSDK();
});

// Reset handlers after each test
afterEach(() => {
  server.resetHandlers();
  vi.clearAllMocks();
});

// Clean up after all tests
afterAll(() => {
  server.close();
});

// Initialize all SDK components
export function setupSDK() {
  // Initialize the auth module
  initAuth(mockLogto, { $logto: mockLogto });
  
  // Initialize the data client
  initDataClient(mockClient);
  
  // Initialize analytics
  initAnalytics(mockTrack, mockIdentify);
}

// Mock Vue's ref and computed (needed for some tests)
vi.mock('vue', async () => {
  const actual = await vi.importActual('vue');
  return {
    ...actual,
    ref: (val) => ({
      value: val,
      _isRef: true
    }),
    computed: (getter) => ({
      value: typeof getter === 'function' ? getter() : getter,
      _isRef: true
    })
  };
});