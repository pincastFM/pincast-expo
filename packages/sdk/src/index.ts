// Export types
export * from './types';

// Export composables
export { 
  usePincastAuth, 
  usePincastData, 
  usePincastLocation, 
  usePincastAnalytics 
} from './composables';

// Export utils
export * from './utils/proxy';

// Export client
export { createPincastClient } from './runtime/client';

// Re-export specific types for better IDE support
export type {
  PincastSession,
  GeoPoint,
  LocationData,
  EventProperties,
  BaseItem,
  GeoItem,
  QueryParams,
  PincastClientConfig,
  PincastPlugin
} from './types';