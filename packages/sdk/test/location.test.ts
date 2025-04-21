import { describe, it, expect, vi, beforeEach } from 'vitest';
import { usePincastLocation, calculateDistance } from '../src/composables/usePincastLocation';

// Mock the Geolocation API
const mockGeolocation = () => {
  const getCurrentPosition = vi.fn();
  const watchPosition = vi.fn();
  const clearWatch = vi.fn();

  Object.defineProperty(global.navigator, 'geolocation', {
    value: {
      getCurrentPosition,
      watchPosition,
      clearWatch
    },
    writable: true
  });

  return {
    getCurrentPosition,
    watchPosition,
    clearWatch
  };
};

describe('usePincastLocation composable', () => {
  const { getCurrentPosition, watchPosition, clearWatch } = mockGeolocation();

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should calculate distance correctly', () => {
    const point1 = { latitude: 40.7128, longitude: -74.006 }; // New York
    const point2 = { latitude: 34.0522, longitude: -118.2437 }; // Los Angeles
    
    // Approximate distance between NY and LA is ~3940km
    const distance = calculateDistance(point1, point2);
    
    // Allow for some rounding error
    expect(distance).toBeGreaterThan(3900000); // 3900km in meters
    expect(distance).toBeLessThan(4000000); // 4000km in meters
  });

  it('should get current position', async () => {
    // Setup mock response
    const mockPosition = {
      coords: {
        latitude: 40.7128,
        longitude: -74.006,
        accuracy: 10
      },
      timestamp: Date.now()
    };
    
    getCurrentPosition.mockImplementation((success) => {
      success(mockPosition);
    });
    
    const location = usePincastLocation();
    const result = await location.getCurrentPosition();
    
    expect(result.latitude).toBe(mockPosition.coords.latitude);
    expect(result.longitude).toBe(mockPosition.coords.longitude);
    expect(result.accuracy).toBe(mockPosition.coords.accuracy);
    expect(location.coords.value.latitude).toBe(mockPosition.coords.latitude);
    expect(location.coords.value.longitude).toBe(mockPosition.coords.longitude);
  });

  it('should handle geolocation errors', async () => {
    // Setup mock error
    const mockError = {
      code: 1,
      message: 'User denied geolocation'
    };
    
    getCurrentPosition.mockImplementation((success, error) => {
      error(mockError);
    });
    
    const location = usePincastLocation();
    
    try {
      await location.getCurrentPosition();
      // Should not reach here
      expect(true).toBe(false);
    } catch (error) {
      expect(error).toEqual(mockError);
      expect(location.error.value).toEqual(mockError);
    }
  });

  it('should watch position changes', () => {
    // Setup mock response
    const mockPosition = {
      coords: {
        latitude: 40.7128,
        longitude: -74.006,
        accuracy: 10
      },
      timestamp: Date.now()
    };
    
    watchPosition.mockImplementation((success) => {
      success(mockPosition);
      return 123; // Mock watch ID
    });
    
    const location = usePincastLocation();
    location.startWatching();
    
    expect(watchPosition).toHaveBeenCalled();
    expect(location.isWatching.value).toBe(true);
    expect(location.coords.value.latitude).toBe(mockPosition.coords.latitude);
    expect(location.coords.value.longitude).toBe(mockPosition.coords.longitude);
  });

  it('should stop watching position', () => {
    // Setup mock watch ID
    watchPosition.mockReturnValue(123);
    
    const location = usePincastLocation();
    location.startWatching();
    location.stopWatching();
    
    expect(clearWatch).toHaveBeenCalledWith(123);
    expect(location.isWatching.value).toBe(false);
  });

  it('should calculate distance to a point', () => {
    const location = usePincastLocation();
    
    // Set current location
    location.location.value = {
      latitude: 40.7128,
      longitude: -74.006,
      accuracy: 10,
      timestamp: Date.now()
    };
    
    // Point about 5km away
    const point = {
      latitude: 40.7128,
      longitude: -74.07 // ~5km west
    };
    
    const distance = location.distanceTo(point);
    
    // Allow for some rounding error
    expect(distance).toBeGreaterThan(4000); // 4km in meters
    expect(distance).toBeLessThan(6000); // 6km in meters
  });

  it('should check if a point is within distance', () => {
    const location = usePincastLocation();
    
    // Set current location
    location.location.value = {
      latitude: 40.7128,
      longitude: -74.006,
      accuracy: 10,
      timestamp: Date.now()
    };
    
    // Point within 1km
    const nearbyPoint = {
      latitude: 40.7128,
      longitude: -74.015 // ~1km west
    };
    
    // Point about 5km away
    const farPoint = {
      latitude: 40.7128,
      longitude: -74.07 // ~5km west
    };
    
    expect(location.isWithinDistance(nearbyPoint, 1000)).toBe(true);
    expect(location.isWithinDistance(farPoint, 1000)).toBe(false);
  });

  it('should find nearby items', () => {
    const location = usePincastLocation();
    
    // Set current location
    location.location.value = {
      latitude: 40.7128,
      longitude: -74.006,
      accuracy: 10,
      timestamp: Date.now()
    };
    
    const items = [
      { id: '1', name: 'Near Item', latitude: 40.7128, longitude: -74.015 }, // ~1km
      { id: '2', name: 'Far Item', latitude: 40.7128, longitude: -74.07 }, // ~5km
      { id: '3', name: 'Very Near Item', latitude: 40.7129, longitude: -74.007 } // ~100m
    ];
    
    const nearbyItems = location.findNearbyItems(items, 2000); // 2km radius
    
    expect(nearbyItems.length).toBe(2);
    expect(nearbyItems[0].id).toBe('3'); // Closest first
    expect(nearbyItems[1].id).toBe('1');
    
    // Should all have distance calculated
    expect(nearbyItems[0].distance).toBeDefined();
    expect(nearbyItems[1].distance).toBeDefined();
  });
});