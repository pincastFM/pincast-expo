// Type definitions for @pincast/sdk

/**
 * Geographic point with longitude and latitude
 */
export interface GeoPoint {
  longitude: number;
  latitude: number;
}

/**
 * GeoJSON point format
 */
export interface GeoJSONPoint {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

/**
 * Location data with optional accuracy
 */
export interface LocationData extends GeoPoint {
  accuracy?: number;
  timestamp?: number;
}

/**
 * User session information
 */
export interface PincastSession {
  id: string;
  email?: string | null;
  role: 'player' | 'developer' | 'staff';
  token?: string;
  isAuthenticated: boolean;
}

/**
 * Analytics event properties
 */
export interface EventProperties {
  [key: string]: string | number | boolean | null | undefined;
}

/**
 * Data API collection item base interface
 */
export interface BaseItem {
  id: string;
  [key: string]: unknown;
}

/**
 * Geo-enabled item with location
 */
export interface GeoItem extends BaseItem {
  location: GeoJSONPoint;
}

/**
 * Query parameters for data API
 */
export interface QueryParams {
  near?: GeoPoint;
  radius?: number;
  limit?: number;
  sort?: string;
  [key: string]: unknown;
}

/**
 * Client configuration
 */
export interface PincastClientConfig {
  apiBase: string;
  devMode?: boolean;
}

/**
 * SDK plugin interface
 */
export interface PincastPlugin {
  auth: {
    signIn: (options?: { redirectUri?: string }) => Promise<void>;
    signOut: (options?: { postLogoutRedirectUri?: string }) => Promise<void>;
    getToken: () => Promise<string | null>;
    getSession: () => Promise<PincastSession>;
  };
  data: <T extends BaseItem = BaseItem>(collection: string) => {
    getAll: (params?: QueryParams) => Promise<T[]>;
    getById: (id: string) => Promise<T | null>;
    create: (item: Omit<T, 'id'>) => Promise<T>;
    update: (id: string, item: Partial<T>) => Promise<T>;
    delete: (id: string) => Promise<boolean>;
    near: (point: GeoPoint, radius?: number) => Promise<(T & { distance?: number })[]>;
  };
  analytics: {
    track: (event: string, properties?: EventProperties) => Promise<boolean>;
    identify: (id: string, traits?: Record<string, unknown>) => Promise<boolean>;
  };
}

/**
 * App configuration from pincast.json
 */
export interface PincastConfig {
  title: string;
  slug: string;
  geo: {
    center: [number, number]; // [longitude, latitude]
    radiusMeters: number;
  };
  heroUrl?: string;
}