declare module '@pincast/sdk' {
  // Re-export the types from the SDK
  export interface GeoPoint {
    longitude: number;
    latitude: number;
  }

  export interface PincastSession {
    id: string;
    email?: string | null;
    role: 'player' | 'developer' | 'staff';
    token?: string;
    isAuthenticated: boolean;
  }

  export interface LocationData extends GeoPoint {
    accuracy?: number;
    timestamp?: number;
  }

  export interface BaseItem {
    id: string;
    [key: string]: unknown;
  }

  // Composables exports
  export function usePincastAuth(): {
    signIn: (options?: { redirectUri?: string }) => Promise<void>;
    signOut: (options?: { postLogoutRedirectUri?: string }) => Promise<void>;
    getToken: () => Promise<string | null>;
    getSession: () => Promise<PincastSession>;
    refreshSession: () => Promise<PincastSession>;
    session: import('vue').ComputedRef<PincastSession>;
    isAuthenticated: import('vue').ComputedRef<boolean>;
    player: import('vue').ComputedRef<{ id: string; email: string | null }>;
    role: import('vue').ComputedRef<PincastSession['role']>;
  };

  export function usePincastLocation(): {
    location: import('vue').Ref<LocationData>;
    coords: import('vue').ComputedRef<GeoPoint>;
    accuracy: import('vue').ComputedRef<number | undefined>;
    error: import('vue').Ref<GeolocationPositionError | null>;
    isWatching: import('vue').Ref<boolean>;
    getCurrentPosition: () => Promise<LocationData>;
    startWatching: () => void;
    stopWatching: () => void;
    distanceTo: (point: GeoPoint) => number;
    isWithinDistance: (point: GeoPoint, distance: number) => boolean;
    findNearbyItems: <T extends GeoPoint>(items: T[], maxDistance?: number) => (T & { distance: number })[];
  };

  export function usePincastData<T extends BaseItem = BaseItem>(collection: string): {
    getAll: (params?: any) => Promise<T[]>;
    getById: (id: string) => Promise<T | null>;
    create: (data: Omit<T, 'id'>) => Promise<T>;
    update: (id: string, data: Partial<T>) => Promise<T>;
    remove: (id: string) => Promise<boolean>;
    near: <G extends BaseItem = T & { location: any }>(
      point: GeoPoint,
      radius?: number
    ) => Promise<(G & { distance?: number })[]>;
    query: (params: any) => Promise<T[]>;
    store: (data: Partial<T> & { id?: string }) => Promise<T>;
  };

  export function usePincastAnalytics(): {
    track: (event: string, properties?: Record<string, any>) => Promise<boolean>;
    identify: (id: string, traits?: Record<string, any>) => Promise<boolean>;
    pageView: (page: string, properties?: Record<string, any>) => Promise<boolean>;
  };
}