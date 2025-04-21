import { ref } from 'vue';
import { z } from 'zod';
import type { CatalogItem } from '~/server/api/catalog.get';
import type { AppDetail } from '~/server/api/apps/[slug].get';

// Zod schema for catalog item validation
const catalogItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  heroUrl: z.string().nullable(),
  distanceMeters: z.number().optional(),
  sessions7d: z.number()
});

// Zod schema for catalog response
const catalogResponseSchema = z.array(catalogItemSchema);

/**
 * Sort options for catalog listings
 */
export type SortOption = 'distance' | 'popularity' | 'newest';

/**
 * Location type for geolocation data
 */
export interface Location {
  lat: number;
  lng: number;
}

/**
 * Query options for catalog requests
 */
export interface CatalogOptions {
  lat?: number;
  lng?: number;
  radius?: number;
  sort?: SortOption;
}

/**
 * Composable for interacting with the catalog API
 */
export function useCatalog() {
  const loading = ref(false);
  const error = ref<string | null>(null);
  const items = ref<CatalogItem[]>([]);
  const currentApp = ref<AppDetail | null>(null);
  const currentSort = ref<SortOption>('distance');
  const userLocation = ref<Location | null>(null);
  
  /**
   * Sets the user's location for use in distance calculations
   */
  const setUserLocation = (lat: number, lng: number): void => {
    userLocation.value = { lat, lng };
  };
  
  /**
   * Loads the catalog with optional filtering options
   * @returns Promise that resolves with the loaded catalog items
   */
  const load = async (options: CatalogOptions = {}): Promise<CatalogItem[]> => {
    loading.value = true;
    error.value = null;
    
    try {
      // Merge defaults with options
      const queryOptions: CatalogOptions = {
        sort: options.sort || currentSort.value,
        radius: options.radius || 50000, // Default to 50km
      };
      
      // Use provided location or stored user location
      if (options.lat && options.lng) {
        queryOptions.lat = options.lat;
        queryOptions.lng = options.lng;
      } else if (userLocation.value) {
        queryOptions.lat = userLocation.value.lat;
        queryOptions.lng = userLocation.value.lng;
      }
      
      // Update current sort
      if (options.sort) {
        currentSort.value = options.sort;
      }
      
      // Build query string
      const queryParams = new URLSearchParams();
      Object.entries(queryOptions).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, String(value));
        }
      });
      
      // Fetch catalog data
      const response = await $fetch<unknown>(`/api/catalog?${queryParams.toString()}`);
      
      // Validate response with Zod schema
      try {
        const catalogData = catalogResponseSchema.parse(response);
        // Ensure the items are properly typed as CatalogItem[]
        const typedCatalogData: CatalogItem[] = catalogData.map(item => ({
          id: item.id,
          title: item.title,
          slug: item.slug,
          heroUrl: item.heroUrl,
          sessions7d: item.sessions7d,
          ...(item.distanceMeters !== undefined ? { distanceMeters: item.distanceMeters } : {})
        }));
        items.value = typedCatalogData;
        return typedCatalogData;
      } catch (parseError) {
        console.error('Invalid catalog data format:', parseError);
        error.value = 'The catalog data received was in an invalid format';
        items.value = [];
        return [];
      }
    } catch (err) {
      console.error('Error loading catalog:', err);
      error.value = err instanceof Error ? err.message : 'Failed to load catalog';
      items.value = [];
      return [];
    } finally {
      loading.value = false;
    }
  };
  
  /**
   * Loads a specific app by slug
   * @returns Promise that resolves with the app data or null
   */
  const loadAppBySlug = async (slug: string): Promise<AppDetail | null> => {
    loading.value = true;
    error.value = null;
    
    try {
      const appData = await $fetch<AppDetail>(`/api/apps/${slug}`);
      currentApp.value = appData;
    } catch (err) {
      console.error(`Error loading app "${slug}":`, err);
      error.value = err instanceof Error ? err.message : `Failed to load app "${slug}"`;
      currentApp.value = null;
    } finally {
      loading.value = false;
    }
    
    return currentApp.value;
  };
  
  /**
   * Gets the user's current location using browser geolocation
   * @returns Promise that resolves with location coordinates
   */
  const getUserLocation = async (): Promise<Location> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
        return;
      }
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location: Location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location.lat, location.lng);
          resolve(location);
        },
        (err) => {
          console.error('Geolocation error:', err);
          reject(new Error(`Failed to get location: ${err.message}`));
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    });
  };
  
  /**
   * Formats distance for display (m or km)
   * @param meters Distance in meters
   * @returns Formatted distance string
   */
  const formatDistance = (meters: number): string => {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
  };
  
  /**
   * Returns static map URL for a location
   * @returns URL for static map image
   */
  const getStaticMapUrl = (longitude: number, latitude: number, zoom = 14, width = 600, height = 300): string => {
    // Use environment variable or fallback to a placeholder
    const accessToken = process.env.MAPBOX_ACCESS_TOKEN || 'pk.eyJ1IjoicGluY2FzdCIsImEiOiJjbDg1N2FmNGQwMDJrM3BueTFmeHZvbGtiIn0.1xKRtKPIoN5XkNgZjejHCw';
    return `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/pin-l+f74e4e(${longitude},${latitude})/${longitude},${latitude},${zoom}/${width}x${height}@2x?access_token=${accessToken}`;
  };
  
  return {
    // State
    loading,
    error,
    items,
    currentApp,
    currentSort,
    userLocation,
    
    // Methods
    load,
    loadCatalog: load, // Alias for backward compatibility
    loadAppBySlug,
    getUserLocation,
    setUserLocation,
    formatDistance,
    getStaticMapUrl,
  };
}