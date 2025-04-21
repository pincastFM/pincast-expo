import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { usePincastLocation } from '../src/composables/usePincastLocation';

// Mock the navigator.geolocation
const mockGeolocation = {
  getCurrentPosition: vi.fn(),
  watchPosition: vi.fn(),
  clearWatch: vi.fn()
};

describe('SDK Runtime Tests', () => {
  beforeEach(() => {
    // Setup mock geolocation
    global.navigator.geolocation = mockGeolocation;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('usePincastLocation', () => {
    it('updates coords when getCurrentPosition succeeds', async () => {
      // Setup mock to succeed
      const mockPosition = {
        coords: {
          latitude: 37.7749,
          longitude: -122.4194,
          accuracy: 10
        },
        timestamp: Date.now()
      };

      mockGeolocation.getCurrentPosition.mockImplementation((success) => {
        success(mockPosition);
      });

      // Use the composable
      const { coords, getCurrentPosition } = usePincastLocation();
      
      // Initial state should be zeros
      expect(coords.value).toEqual({ latitude: 0, longitude: 0 });
      
      // Call to get position
      await getCurrentPosition();
      
      // Check that coords were updated with mock values
      expect(coords.value).toEqual({
        latitude: mockPosition.coords.latitude,
        longitude: mockPosition.coords.longitude
      });
    });

    it('handles errors from getCurrentPosition', async () => {
      // Setup mock to fail
      const mockError = {
        code: 1,
        message: 'User denied geolocation'
      };

      mockGeolocation.getCurrentPosition.mockImplementation((success, error) => {
        error(mockError);
      });

      // Use the composable
      const { error, getCurrentPosition } = usePincastLocation();
      
      // Initially no error
      expect(error.value).toBeNull();
      
      // Call should throw
      await expect(getCurrentPosition()).rejects.toEqual(mockError);
      
      // Error should be set
      expect(error.value).toEqual(mockError);
    });

    it('updates location when watchPosition reports changes', () => {
      // Setup watch to succeed
      const mockPosition1 = {
        coords: {
          latitude: 37.7749,
          longitude: -122.4194,
          accuracy: 10
        },
        timestamp: Date.now()
      };

      const mockPosition2 = {
        coords: {
          latitude: 37.7750, // Slightly different
          longitude: -122.4195,
          accuracy: 8
        },
        timestamp: Date.now() + 1000
      };

      // Return watch ID
      mockGeolocation.watchPosition.mockReturnValue(123);

      // Use the composable
      const { location, startWatching, stopWatching } = usePincastLocation();
      
      // Start watching
      startWatching();
      
      // Get the success callback that was registered
      const successCallback = mockGeolocation.watchPosition.mock.calls[0][0];
      
      // Trigger first position update
      successCallback(mockPosition1);
      
      // Check location updated
      expect(location.value).toEqual({
        latitude: mockPosition1.coords.latitude,
        longitude: mockPosition1.coords.longitude,
        accuracy: mockPosition1.coords.accuracy,
        timestamp: mockPosition1.timestamp
      });
      
      // Trigger second position update
      successCallback(mockPosition2);
      
      // Check location updated again
      expect(location.value).toEqual({
        latitude: mockPosition2.coords.latitude,
        longitude: mockPosition2.coords.longitude,
        accuracy: mockPosition2.coords.accuracy,
        timestamp: mockPosition2.timestamp
      });
      
      // Stop watching
      stopWatching();
      
      // Should have cleared the watch
      expect(mockGeolocation.clearWatch).toHaveBeenCalledWith(123);
    });
  });
});