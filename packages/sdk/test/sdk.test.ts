import { describe, it, expect, vi, beforeEach } from 'vitest';
import { usePincastAuth } from '../src/composables/usePincastAuth';
import { usePincastLocation } from '../src/composables/usePincastLocation';
import { usePincastData } from '../src/composables/usePincastData';
import { usePincastAnalytics } from '../src/composables/usePincastAnalytics';
import { initAuth } from '../src/composables/usePincastAuth';
import { initDataClient } from '../src/composables/usePincastData';
import { initAnalytics } from '../src/composables/usePincastAnalytics';

// Mock the Logto instance
const mockLogto = {
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

// Mock the client instance
const mockClient = {
  collection: vi.fn().mockReturnValue({
    getAll: vi.fn().mockResolvedValue([]),
    getById: vi.fn().mockResolvedValue(null),
    create: vi.fn().mockResolvedValue({ id: 'new-123' }),
    update: vi.fn().mockResolvedValue({ id: 'updated-123' }),
    delete: vi.fn().mockResolvedValue(true),
    near: vi.fn().mockResolvedValue([])
  })
};

// Mock analytics functions
const mockTrack = vi.fn().mockResolvedValue(true);
const mockIdentify = vi.fn().mockResolvedValue(true);

// Mock the global navigator.geolocation
vi.stubGlobal('navigator', {
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
});

describe('Pincast SDK', () => {
  beforeEach(() => {
    // Initialize SDK components
    initAuth(mockLogto, { $logto: mockLogto });
    initDataClient(mockClient);
    initAnalytics(mockTrack, mockIdentify);
    
    // Clear mock calls
    vi.clearAllMocks();
  });

  describe('usePincastAuth', () => {
    it('should provide authentication functions', async () => {
      const auth = usePincastAuth();
      
      expect(auth.signIn).toBeDefined();
      expect(auth.signOut).toBeDefined();
      expect(auth.getToken).toBeDefined();
      expect(auth.getSession).toBeDefined();
      
      // Test getting a token
      const token = await auth.getToken();
      expect(token).toBe('mock-token-123');
      expect(mockLogto.getAccessToken).toHaveBeenCalled();
      
      // Test session data
      const session = await auth.getSession();
      expect(session.id).toBe('user-123');
      expect(session.email).toBe('test@example.com');
      expect(session.role).toBe('player');
      expect(session.isAuthenticated).toBe(true);
    });
  });
  
  describe('usePincastLocation', () => {
    it('should provide location functions', async () => {
      const location = usePincastLocation();
      
      expect(location.getCurrentPosition).toBeDefined();
      expect(location.startWatching).toBeDefined();
      expect(location.stopWatching).toBeDefined();
      
      // Test getting current position
      const position = await location.getCurrentPosition();
      expect(position.latitude).toBe(40.7128);
      expect(position.longitude).toBe(-74.006);
      expect(navigator.geolocation.getCurrentPosition).toHaveBeenCalled();
      
      // Test distance calculation
      const distance = location.distanceTo({
        latitude: 40.7128,
        longitude: -74.006
      });
      expect(distance).toBeCloseTo(0, 1);
    });
  });
  
  describe('usePincastData', () => {
    it('should provide data functions', async () => {
      // Mock the usePincastAuth function to avoid undefined errors
      vi.mock('../src/composables/usePincastAuth', async () => {
        const actual = await vi.importActual('../src/composables/usePincastAuth');
        return {
          ...actual,
          usePincastAuth: () => ({
            getToken: vi.fn().mockResolvedValue('mock-token-123'),
            getSession: vi.fn().mockResolvedValue({
              id: 'user-123',
              email: 'test@example.com',
              role: 'player',
              isAuthenticated: true
            })
          })
        };
      });
      
      // Re-import after mocking
      const { usePincastData } = await import('../src/composables/usePincastData');
      
      const data = usePincastData('test-collection');
      
      expect(data.getAll).toBeDefined();
      expect(data.getById).toBeDefined();
      expect(data.create).toBeDefined();
      expect(data.update).toBeDefined();
      expect(data.remove).toBeDefined();
      
      // Test functions available
      expect(typeof data.getAll).toBe('function');
      expect(typeof data.getById).toBe('function');
      expect(typeof data.create).toBe('function');
      expect(typeof data.update).toBe('function');
      expect(typeof data.remove).toBe('function');
      expect(typeof data.near).toBe('function');
      expect(typeof data.query).toBe('function');
      expect(typeof data.store).toBe('function');
    });
  });
  
  describe('usePincastAnalytics', () => {
    it('should provide analytics functions', async () => {
      // Mock the usePincastAuth function to avoid undefined errors
      vi.mock('../src/composables/usePincastAuth', async () => {
        const actual = await vi.importActual('../src/composables/usePincastAuth');
        return {
          ...actual,
          usePincastAuth: () => ({
            getToken: vi.fn().mockResolvedValue('mock-token-123'),
            getSession: vi.fn().mockResolvedValue({
              id: 'user-123',
              email: 'test@example.com',
              role: 'player',
              isAuthenticated: true
            })
          })
        };
      });
      
      // Re-import after mocking
      const { usePincastAnalytics } = await import('../src/composables/usePincastAnalytics');
      
      const analytics = usePincastAnalytics();
      
      expect(analytics.track).toBeDefined();
      expect(analytics.identify).toBeDefined();
      expect(analytics.pageView).toBeDefined();
      
      // Check if functions have correct types
      expect(typeof analytics.track).toBe('function');
      expect(typeof analytics.identify).toBe('function');
      expect(typeof analytics.pageView).toBe('function');
    });
  });
});