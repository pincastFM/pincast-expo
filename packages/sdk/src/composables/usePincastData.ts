import type { BaseItem, GeoItem, GeoPoint, QueryParams } from '../types';
import { usePincastAuth } from './usePincastAuth';

// This will be provided by the Nuxt plugin context
let clientInstance: any = null;

/**
 * Initialize the data composable with the client instance
 * This is called by the Nuxt plugin
 */
export const initDataClient = (client: any) => {
  clientInstance = client;
};

/**
 * Composable for interacting with the Pincast Data API
 * @param collection The collection name to interact with
 */
export const usePincastData = <T extends BaseItem = BaseItem>(collection: string) => {
  // Use client from plugin context or throw error
  if (!clientInstance) {
    throw new Error('Pincast data client has not been initialized. Make sure the plugin is properly installed.');
  }
  
  const auth = usePincastAuth();
  const collectionClient = clientInstance.collection(collection);
  
  /**
   * Get all items in the collection
   */
  const getAll = async (params?: QueryParams): Promise<T[]> => {
    const token = await auth.getToken();
    return collectionClient.getAll(params, token);
  };
  
  /**
   * Get a single item by ID
   */
  const getById = async (id: string): Promise<T | null> => {
    const token = await auth.getToken();
    return collectionClient.getById(id, token);
  };
  
  /**
   * Create a new item
   */
  const create = async (data: Omit<T, 'id'>): Promise<T> => {
    const token = await auth.getToken();
    return collectionClient.create(data, token);
  };
  
  /**
   * Update an existing item
   */
  const update = async (id: string, data: Partial<T>): Promise<T> => {
    const token = await auth.getToken();
    return collectionClient.update(id, data, token);
  };
  
  /**
   * Delete an item
   */
  const remove = async (id: string): Promise<boolean> => {
    const token = await auth.getToken();
    return collectionClient.delete(id, token);
  };
  
  /**
   * Find items near a geographic point
   */
  const near = async <G extends GeoItem = T & GeoItem>(
    point: GeoPoint,
    radius: number = 1000
  ): Promise<(G & { distance?: number })[]> => {
    const token = await auth.getToken();
    return collectionClient.near(point, radius, token) as Promise<(G & { distance?: number })[]>;
  };
  
  /**
   * Query items with advanced filtering
   */
  const query = async (params: QueryParams): Promise<T[]> => {
    return getAll(params);
  };
  
  /**
   * Store a new item or update if it exists
   */
  const store = async (data: Partial<T> & { id?: string }): Promise<T> => {
    if (data.id) {
      return update(data.id, data);
    } else {
      return create(data as Omit<T, 'id'>);
    }
  };
  
  return {
    getAll,
    getById,
    create,
    update,
    remove,
    near,
    query,
    store
  };
};