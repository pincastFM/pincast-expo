import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useCatalog } from '~/composables/useCatalog';

// Mock fetch
vi.mock('#app', () => ({
  $fetch: vi.fn(),
}));

// Mock window.navigator.geolocation
Object.defineProperty(global, 'navigator', {
  value: {
    geolocation: {
      getCurrentPosition: vi.fn((success) => {
        success({
          coords: {
            latitude: 40.7128,
            longitude: -74.0060,
            accuracy: 10,
          },
          timestamp: Date.now(),
        });
      }),
    },
  },
  writable: true,
});

describe('useCatalog composable', () => {
  let catalog: ReturnType<typeof useCatalog>;
  
  beforeEach(() => {
    vi.resetAllMocks();
    // Re-create the catalog composable for each test
    catalog = useCatalog();
  });
  
  it('should load catalog data with specified options', async () => {
    // Setup
    const mockCatalogData = [
      {
        id: 'app-1',
        title: 'Test App 1',
        slug: 'test-app-1',
        heroUrl: 'https://example.com/hero1.jpg',
        distanceMeters: 1234,
        sessions7d: 42,
      },
      {
        id: 'app-2',
        title: 'Test App 2',
        slug: 'test-app-2',
        heroUrl: null,
        distanceMeters: 5678,
        sessions7d: 10,
      },
    ];
    
    // Mock fetch to return our test data
    const fetchMock = vi.fn().mockResolvedValue(mockCatalogData);
    vi.stubGlobal('$fetch', fetchMock);
    
    // Call the load function with specific options
    const options = {
      sort: 'distance' as const,
      radius: 10000,
      lat: 40.7128,
      lng: -74.0060,
    };
    
    // Act
    const result = await catalog.load(options);
    
    // Assert
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/catalog?sort=distance&radius=10000&lat=40.7128&lng=-74.006'
    );
    
    // Check that the result is correct
    expect(result).toEqual(mockCatalogData);
    
    // Check that items ref was updated
    expect(catalog.items.value).toEqual(mockCatalogData);
  });
  
  it('should handle invalid data format', async () => {
    // Mock fetch to return invalid data
    const invalidData = { invalid: 'data-format' };
    const fetchMock = vi.fn().mockResolvedValue(invalidData);
    vi.stubGlobal('$fetch', fetchMock);
    
    // Act
    const result = await catalog.load();
    
    // Assert
    expect(result).toEqual([]);
    expect(catalog.items.value).toEqual([]);
    expect(catalog.error.value).toContain('invalid format');
  });
  
  it('should handle fetch errors gracefully', async () => {
    // Mock fetch to throw an error
    const fetchError = new Error('Network error');
    const fetchMock = vi.fn().mockRejectedValue(fetchError);
    vi.stubGlobal('$fetch', fetchMock);
    
    // Act
    const result = await catalog.load();
    
    // Assert
    expect(result).toEqual([]);
    expect(catalog.items.value).toEqual([]);
    expect(catalog.error.value).toBe('Network error');
  });
  
  it('should format distance properly', () => {
    // Test meters
    expect(catalog.formatDistance(750)).toBe('750m');
    
    // Test kilometers
    expect(catalog.formatDistance(1500)).toBe('1.5km');
    expect(catalog.formatDistance(10000)).toBe('10.0km');
  });
  
  it('should get user location using browser geolocation', async () => {
    // Act
    const location = await catalog.getUserLocation();
    
    // Assert
    expect(location.lat).toBe(40.7128);
    expect(location.lng).toBe(-74.0060);
    expect(catalog.userLocation.value).toEqual({ lat: 40.7128, lng: -74.0060 });
    expect(navigator.geolocation.getCurrentPosition).toHaveBeenCalled();
  });
});