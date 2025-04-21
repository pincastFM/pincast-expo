import type { BaseItem, GeoPoint, QueryParams } from '../types';
import { getApiBaseUrl } from '../utils/proxy';

/**
 * Create a client for interacting with the Pincast Data API
 */
export const createPincastClient = (configuredApiBase: string) => {
  const apiBase = getApiBaseUrl(configuredApiBase);
  
  /**
   * Internal fetch wrapper with authentication and error handling
   */
  const fetchWithAuth = async <T>(
    path: string,
    options: RequestInit = {},
    token?: string
  ): Promise<T> => {
    const url = `${apiBase}${path}`;
    const headers = new Headers(options.headers);
    
    // Add auth header if token is provided
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    
    // Add content-type if not provided and method is not GET
    if (!headers.has('Content-Type') && options.method !== 'GET') {
      headers.set('Content-Type', 'application/json');
    }
    
    const response = await fetch(url, {
      ...options,
      headers
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API error (${response.status}): ${error}`);
    }
    
    // Return empty object for 204 No Content
    if (response.status === 204) {
      return {} as T;
    }
    
    return response.json() as Promise<T>;
  };
  
  /**
   * Get a client for a specific collection
   */
  const getCollectionClient = <T extends BaseItem>(collection: string) => {
    const basePath = `/data/${collection}`;
    
    return {
      /**
       * Get all items in the collection
       */
      getAll: async (params?: QueryParams, token?: string): Promise<T[]> => {
        const searchParams = new URLSearchParams();
        
        if (params) {
          // Convert params to URL search params
          Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined) {
              if (key === 'near' && typeof value === 'object') {
                const near = value as GeoPoint;
                searchParams.set('lng', near.longitude.toString());
                searchParams.set('lat', near.latitude.toString());
              } else {
                searchParams.set(key, String(value));
              }
            }
          });
        }
        
        const queryString = searchParams.toString();
        const path = queryString ? `${basePath}?${queryString}` : basePath;
        
        return fetchWithAuth<T[]>(path, { method: 'GET' }, token);
      },
      
      /**
       * Get a single item by ID
       */
      getById: async (id: string, token?: string): Promise<T | null> => {
        try {
          return await fetchWithAuth<T>(`${basePath}/${id}`, { method: 'GET' }, token);
        } catch (error) {
          if (error instanceof Error && error.message.includes('404')) {
            return null;
          }
          throw error;
        }
      },
      
      /**
       * Create a new item
       */
      create: async (data: Omit<T, 'id'>, token?: string): Promise<T> => {
        return fetchWithAuth<T>(basePath, {
          method: 'POST',
          body: JSON.stringify(data)
        }, token);
      },
      
      /**
       * Update an existing item
       */
      update: async (id: string, data: Partial<T>, token?: string): Promise<T> => {
        return fetchWithAuth<T>(`${basePath}/${id}`, {
          method: 'PATCH',
          body: JSON.stringify(data)
        }, token);
      },
      
      /**
       * Delete an item
       */
      delete: async (id: string, token?: string): Promise<boolean> => {
        try {
          await fetchWithAuth(`${basePath}/${id}`, { method: 'DELETE' }, token);
          return true;
        } catch (error) {
          return false;
        }
      },
      
      /**
       * Find items near a geographic point
       */
      near: async (point: GeoPoint, radius: number = 1000, token?: string): Promise<(T & { distance?: number })[]> => {
        const searchParams = new URLSearchParams({
          lng: point.longitude.toString(),
          lat: point.latitude.toString(),
          radius: radius.toString()
        });
        
        return fetchWithAuth<(T & { distance?: number })[]>(
          `${basePath}/near?${searchParams.toString()}`,
          { method: 'GET' },
          token
        );
      }
    };
  };
  
  return {
    collection: getCollectionClient
  };
};