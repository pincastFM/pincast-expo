import { ref, onBeforeUnmount, onMounted } from 'vue';
import type { EventProperties } from '../types';
import { usePincastAuth } from './usePincastAuth';

// Default implementation that logs to console in development
const defaultTrack = (event: string, properties?: EventProperties): Promise<boolean> => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[Analytics] Event: ${event}`, properties);
  }
  return Promise.resolve(true);
};

const defaultIdentify = (id: string, traits?: Record<string, unknown>): Promise<boolean> => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[Analytics] Identify user: ${id}`, traits);
  }
  return Promise.resolve(true);
};

// Default batch implementation that calls the individual track function for each event
const defaultBatch = (events: Array<{event: string, properties?: EventProperties}>): Promise<boolean> => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[Analytics] Batch events: ${events.length} events`);
    events.forEach(({ event, properties }) => {
      console.log(`- ${event}`, properties);
    });
  }
  return Promise.resolve(true);
};

// These will be set by the plugin
let trackImplementation: typeof defaultTrack = defaultTrack;
let identifyImplementation: typeof defaultIdentify = defaultIdentify;
let batchImplementation: typeof defaultBatch = defaultBatch;

// Configuration options
let batchEventsEnabled = true;
let batchInterval = 5000; // 5 seconds
let maxBatchSize = 20; // Maximum number of events in a batch

// Event queue for batching
const eventQueue = ref<Array<{event: string, properties?: EventProperties}>>([]);
let batchTimeoutId: number | null = null;

/**
 * Flush the event queue
 */
const flushEvents = async (): Promise<boolean> => {
  if (eventQueue.value.length === 0) {
    return true;
  }
  
  // Clone the current queue
  const events = [...eventQueue.value];
  
  // Clear the queue immediately
  eventQueue.value = [];
  
  // If batching is enabled and we have a batch implementation, use it
  if (batchEventsEnabled && events.length > 1) {
    try {
      return await batchImplementation(events);
    } catch (error) {
      console.error('Failed to batch events:', error);
      
      // Fall back to individual track calls
      for (const { event, properties } of events) {
        try {
          await trackImplementation(event, properties);
        } catch (innerError) {
          console.error(`Failed to track event "${event}":`, innerError);
        }
      }
      
      return false;
    }
  } else {
    // Process events individually
    let success = true;
    
    for (const { event, properties } of events) {
      try {
        const result = await trackImplementation(event, properties);
        if (!result) success = false;
      } catch (error) {
        console.error(`Failed to track event "${event}":`, error);
        success = false;
      }
    }
    
    return success;
  }
};

/**
 * Schedule a flush of the event queue
 */
const scheduleBatchFlush = () => {
  // Clear any existing timeout
  if (batchTimeoutId !== null) {
    clearTimeout(batchTimeoutId);
  }
  
  // Set a new timeout
  batchTimeoutId = window.setTimeout(() => {
    flushEvents();
    batchTimeoutId = null;
  }, batchInterval);
};

/**
 * Initialize the analytics implementation
 * This is called by the Nuxt plugin
 */
export const initAnalytics = (
  trackFn?: typeof defaultTrack,
  identifyFn?: typeof defaultIdentify,
  batchFn?: typeof defaultBatch,
  options?: {
    batchEvents?: boolean;
    batchInterval?: number;
    maxBatchSize?: number;
  }
) => {
  if (trackFn) trackImplementation = trackFn;
  if (identifyFn) identifyImplementation = identifyFn;
  if (batchFn) batchImplementation = batchFn;
  
  // Set options
  if (options) {
    if (typeof options.batchEvents === 'boolean') {
      batchEventsEnabled = options.batchEvents;
    }
    
    if (typeof options.batchInterval === 'number' && options.batchInterval > 0) {
      batchInterval = options.batchInterval;
    }
    
    if (typeof options.maxBatchSize === 'number' && options.maxBatchSize > 0) {
      maxBatchSize = options.maxBatchSize;
    }
  }
};

/**
 * Hook for tracking analytics events
 */
export const usePincastAnalytics = () => {
  const auth = usePincastAuth();
  
  /**
   * Add an event to the queue or send immediately if batching is disabled
   */
  const trackEvent = async (event: string, properties?: EventProperties): Promise<boolean> => {
    try {
      // Get current user info to add to event
      const session = await auth.getSession();
      
      // Add user ID as player_id if authenticated
      const enrichedProperties = {
        player_id: session.id,
        app_id: window.$pincast?.appId, // Include app ID if available
        ...properties,
      };
      
      if (batchEventsEnabled) {
        // Add to queue
        eventQueue.value.push({ event, properties: enrichedProperties });
        
        // Schedule flush
        scheduleBatchFlush();
        
        // If queue exceeds max size, flush immediately
        if (eventQueue.value.length >= maxBatchSize) {
          flushEvents();
        }
        
        return true;
      } else {
        // Send immediately
        return trackImplementation(event, enrichedProperties);
      }
    } catch (error) {
      console.error('Failed to track event:', error);
      return false;
    }
  };
  
  /**
   * Track an event with optional properties (alias for trackEvent)
   */
  const track = trackEvent;
  
  /**
   * Identify a user with optional traits
   */
  const identify = async (id?: string, traits?: Record<string, unknown>): Promise<boolean> => {
    try {
      // If no ID is provided, use the current user ID
      let userId = id;
      
      if (!userId) {
        const session = await auth.getSession();
        userId = session.id;
      }
      
      if (!userId) {
        console.warn('No user ID available for identification');
        return false;
      }
      
      // Get additional user info if available
      const enrichedTraits = {
        ...traits,
      };
      
      if (!traits?.email) {
        const session = await auth.getSession();
        if (session.email) {
          enrichedTraits.email = session.email;
        }
      }
      
      return identifyImplementation(userId, enrichedTraits);
    } catch (error) {
      console.error('Failed to identify user:', error);
      return false;
    }
  };
  
  /**
   * Track a page view
   */
  const pageView = async (page: string, properties?: EventProperties): Promise<boolean> => {
    return track('page_view', { page, ...properties });
  };
  
  /**
   * Track a session start event
   */
  const sessionStart = async (properties?: EventProperties): Promise<boolean> => {
    return track('session_start', properties);
  };
  
  /**
   * Force flush any queued events immediately
   */
  const flush = flushEvents;
  
  // Set up lifecycle hooks
  onMounted(() => {
    // Track session start when component is mounted
    sessionStart();
  });
  
  onBeforeUnmount(() => {
    // Flush any remaining events before unmounting
    if (eventQueue.value.length > 0) {
      flush();
    }
    
    // Clear any scheduled flushes
    if (batchTimeoutId !== null) {
      clearTimeout(batchTimeoutId);
      batchTimeoutId = null;
    }
  });
  
  return {
    track,
    identify,
    pageView,
    sessionStart,
    flush
  };
};