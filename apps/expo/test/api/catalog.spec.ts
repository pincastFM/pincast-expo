import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockH3Event } from '../utils/mocks';
import catalogHandler from '~/server/api/catalog.get';

// Mock test data
const mockCatalogResults = [
  {
    id: 'app-1',
    title: 'Test App 1',
    slug: 'test-app-1',
    heroUrl: 'https://example.com/hero1.jpg',
    distanceMeters: 1234.56,
    sessions7d: 42
  },
  {
    id: 'app-2',
    title: 'Test App 2',
    slug: 'test-app-2',
    heroUrl: null,
    distanceMeters: 5678.9,
    sessions7d: 0
  }
];

// Create a properly chainable mock DB
vi.mock('~/server/db/db', () => {
  return {
    db: {
      select: vi.fn().mockImplementation(() => ({
        from: vi.fn().mockImplementation(() => ({
          where: vi.fn().mockImplementation(() => ({
            where: vi.fn().mockImplementation(() => ({
              where: vi.fn().mockImplementation(() => ({
                groupBy: vi.fn().mockImplementation(() => ({
                  orderBy: vi.fn().mockResolvedValue(mockCatalogResults),
                  leftJoin: vi.fn().mockImplementation(() => ({
                    orderBy: vi.fn().mockResolvedValue(mockCatalogResults),
                    where: vi.fn().mockResolvedValue(mockCatalogResults),
                    groupBy: vi.fn().mockImplementation(() => ({
                      orderBy: vi.fn().mockResolvedValue(mockCatalogResults),
                    })),
                  })),
                  limit: vi.fn().mockResolvedValue(mockCatalogResults),
                })),
                leftJoin: vi.fn().mockImplementation(() => ({
                  where: vi.fn().mockImplementation(() => ({
                    groupBy: vi.fn().mockImplementation(() => ({
                      orderBy: vi.fn().mockResolvedValue(mockCatalogResults),
                    })),
                  })),
                })),
                orderBy: vi.fn().mockResolvedValue(mockCatalogResults),
              })),
            })),
            groupBy: vi.fn().mockImplementation(() => ({
              orderBy: vi.fn().mockResolvedValue(mockCatalogResults),
            })),
            orderBy: vi.fn().mockResolvedValue(mockCatalogResults),
            leftJoin: vi.fn().mockImplementation(() => ({
              where: vi.fn().mockImplementation(() => ({
                groupBy: vi.fn().mockImplementation(() => ({
                  orderBy: vi.fn().mockResolvedValue(mockCatalogResults),
                })),
              })),
              groupBy: vi.fn().mockImplementation(() => ({
                orderBy: vi.fn().mockResolvedValue(mockCatalogResults),
              })),
            })),
          })),
          leftJoin: vi.fn().mockImplementation(() => ({
            where: vi.fn().mockImplementation(() => ({
              where: vi.fn().mockImplementation(() => ({
                groupBy: vi.fn().mockImplementation(() => ({
                  orderBy: vi.fn().mockResolvedValue(mockCatalogResults),
                })),
              })),
              groupBy: vi.fn().mockImplementation(() => ({
                orderBy: vi.fn().mockResolvedValue(mockCatalogResults),
              })),
            })),
          })),
        }))
      }))
    }
  };
});

// Mock the createError function and other Nuxt imports
vi.mock('#imports', () => ({
  createError: (options: any) => ({
    statusCode: options.statusCode,
    message: options.message
  }),
  defineEventHandler: (handler: any) => handler,
  getQuery: (event: any) => event.$query || {},
  getRouterParam: (event: any, param: string) => event.context?.params?.[param]
}));

describe('Catalog API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return catalog items with distance when coordinates are provided', async () => {
    // Create mock event with location params
    const event = createMockH3Event({
      method: 'GET',
      query: {
        lat: '40.7128',
        lng: '-74.0060',
        radius: '10000',
        sort: 'distance'
      }
    });

    const response = await catalogHandler(event);

    expect(response).toHaveLength(2);
    expect(response[0]?.id).toBe('app-1');
    expect(response[0]?.title).toBe('Test App 1');
    expect(response[0]?.distanceMeters).toBe(1235); // Rounded from 1234.56
    expect(response[0]?.sessions7d).toBe(42);
    
    expect(response[1]?.id).toBe('app-2');
    expect(response[1]?.sessions7d).toBe(0);
  });

  it('should handle popularity sort option', async () => {
    // Create mock event with popularity sort
    const event = createMockH3Event({
      method: 'GET',
      query: {
        sort: 'popularity'
      }
    });

    const response = await catalogHandler(event);

    expect(response).toHaveLength(2);
    // Since we're mocking the DB response, the items will be the same
    // But in a real scenario, they would be sorted by popularity
    expect(response[0]?.sessions7d).toBe(42);
  });

  it('should handle newest sort option', async () => {
    // Create mock event with newest sort
    const event = createMockH3Event({
      method: 'GET',
      query: {
        sort: 'newest'
      }
    });

    const response = await catalogHandler(event);

    expect(response).toHaveLength(2);
    // Again, with mocked DB, the order is the same
    expect(response[0]?.id).toBe('app-1');
  });

  it('should handle error when distance sort with no coordinates', async () => {
    // Create mock event with distance sort but no coords
    const event = createMockH3Event({
      method: 'GET',
      query: {
        sort: 'distance'
      }
    });

    try {
      await catalogHandler(event);
      // Should not reach here
      expect(false).toBe(true); // Expected error to be thrown
    } catch (error: any) {
      // Verify the error has the expected properties
      expect(error).toBeDefined();
      expect(error.statusCode).toBe(400);
      expect(error.message).toContain('Latitude and longitude are required');
    }
  });
  
  it('should handle error with invalid coordinates', async () => {
    // Create mock event with invalid latitude
    const event = createMockH3Event({
      method: 'GET',
      query: {
        sort: 'distance',
        lat: '100', // Invalid latitude (outside -90 to 90 range)
        lng: '-74.0060'
      }
    });

    try {
      await catalogHandler(event);
      expect(false).toBe(true); // Expected error to be thrown
    } catch (error: any) {
      expect(error.statusCode).toBe(400);
      expect(error.message).toContain('Latitude must be between -90 and 90');
    }
  });
});