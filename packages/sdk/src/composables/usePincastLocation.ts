import { computed, ref } from 'vue';
import type { GeoPoint, LocationData } from '../types';

/**
 * Calculate distance between two geographic points in meters
 * Uses the Haversine formula
 */
export const calculateDistance = (
  point1: GeoPoint,
  point2: GeoPoint
): number => {
  const toRad = (degrees: number) => (degrees * Math.PI) / 180;
  
  const R = 6371000; // Earth radius in meters
  const dLat = toRad(point2.latitude - point1.latitude);
  const dLon = toRad(point2.longitude - point1.longitude);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(point1.latitude)) * Math.cos(toRad(point2.latitude)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c;
};

/**
 * Composable for handling location-based functionality
 */
export const usePincastLocation = () => {
  // State
  const location = ref<LocationData>({
    latitude: 0,
    longitude: 0,
    accuracy: 0,
    timestamp: 0
  });
  
  const error = ref<GeolocationPositionError | null>(null);
  const isWatching = ref(false);
  const watchId = ref<number | null>(null);
  
  // Computed values for convenience
  const coords = computed(() => ({
    latitude: location.value.latitude,
    longitude: location.value.longitude
  }));
  
  const accuracy = computed(() => location.value.accuracy);
  
  /**
   * Get the current position
   */
  const getCurrentPosition = async (): Promise<LocationData> => {
    if (!navigator.geolocation) {
      throw new Error('Geolocation is not supported by this browser');
    }
    
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation: LocationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
          };
          
          location.value = newLocation;
          error.value = null;
          
          resolve(newLocation);
        },
        (err) => {
          error.value = err;
          reject(err);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    });
  };
  
  /**
   * Start watching position changes
   */
  const startWatching = () => {
    if (!navigator.geolocation) {
      throw new Error('Geolocation is not supported by this browser');
    }
    
    if (isWatching.value) {
      return;
    }
    
    // Clear any existing watch
    stopWatching();
    
    watchId.value = navigator.geolocation.watchPosition(
      (position) => {
        location.value = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        };
        error.value = null;
      },
      (err) => {
        error.value = err;
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
    
    isWatching.value = true;
  };
  
  /**
   * Stop watching position changes
   */
  const stopWatching = () => {
    if (watchId.value !== null) {
      navigator.geolocation.clearWatch(watchId.value);
      watchId.value = null;
      isWatching.value = false;
    }
  };
  
  /**
   * Calculate distance to another point
   */
  const distanceTo = (point: GeoPoint): number => {
    return calculateDistance(
      { latitude: location.value.latitude, longitude: location.value.longitude },
      point
    );
  };

  /**
   * Check if a point is within a specified distance (in meters)
   */
  const isWithinDistance = (point: GeoPoint, distance: number): boolean => {
    return distanceTo(point) <= distance;
  };

  /**
   * Find nearby items from a list based on distance
   */
  const findNearbyItems = <T extends GeoPoint>(
    items: T[],
    maxDistance: number = 1000
  ): (T & { distance: number })[] => {
    return items
      .map(item => ({
        ...item,
        distance: distanceTo(item)
      }))
      .filter(item => item.distance <= maxDistance)
      .sort((a, b) => a.distance - b.distance);
  };
  
  return {
    // State
    location,
    coords,
    accuracy,
    error,
    isWatching,
    
    // Methods
    getCurrentPosition,
    startWatching,
    stopWatching,
    distanceTo,
    isWithinDistance,
    findNearbyItems
  };
};