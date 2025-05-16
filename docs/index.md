---
layout: default
title: Pincast Expo Cursor Extension
description: Build and deploy location-based experiences with Cursor
---

# Pincast Expo for Cursor AI

> Build, test, and deploy location-based experiences directly within Cursor AI - the world's most advanced AI-powered code editor.

[![Version](https://img.shields.io/visual-studio-marketplace/v/pincast.expo)](https://marketplace.visualstudio.com/items?itemName=pincast.expo)
[![Downloads](https://img.shields.io/visual-studio-marketplace/d/pincast.expo)](https://marketplace.visualstudio.com/items?itemName=pincast.expo)
[![Rating](https://img.shields.io/visual-studio-marketplace/r/pincast.expo)](https://marketplace.visualstudio.com/items?itemName=pincast.expo)

## Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Core Concepts](#core-concepts)
4. [API Reference](#api-reference)
5. [Real-World Examples](#real-world-examples)
6. [Advanced Features](#advanced-features)
7. [Development Workflow](#development-workflow)
8. [Best Practices](#best-practices)
9. [Security & Privacy](#security--privacy)
10. [Performance Optimization](#performance-optimization)
11. [Troubleshooting](#troubleshooting)
12. [Contributing](#contributing)

## Introduction

### What is Pincast Expo for Cursor AI?

Pincast Expo is a powerful extension designed specifically for Cursor AI that enables developers to create immersive location-based experiences with the help of AI-powered code generation and real-time location services. By leveraging Cursor AI's advanced code understanding capabilities, Pincast Expo makes it easier than ever to build, test, and deploy location-aware applications.

### Why Cursor AI?

- **AI-Powered Development**: Leverage Cursor AI's advanced code understanding to auto-complete location-based logic
- **Contextual Awareness**: The extension understands your codebase and suggests relevant location features
- **Smart Debugging**: AI-assisted debugging for common location-based issues
- **Intelligent Code Generation**: Generate boilerplate code for common location patterns

### Key Benefits

1. **Rapid Development**
   - AI-powered code completion
   - Smart templates and snippets
   - Automated boilerplate generation
   - Intelligent refactoring suggestions

2. **Enhanced Productivity**
   - Context-aware code suggestions
   - Automated error detection
   - Smart documentation generation
   - Integrated testing tools

3. **Improved Code Quality**
   - AI-driven code reviews
   - Automated best practice enforcement
   - Smart error prevention
   - Performance optimization suggestions

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 8+
- Cursor AI editor
- Logto account for authentication
- Basic understanding of TypeScript
- Familiarity with Vue.js (optional)

### Installation Steps

1. **Install Cursor AI**
   ```bash
   # Download from https://cursor.sh
   # Follow installation wizard
   ```

2. **Install Pincast Extension**
   ```bash
   # Via Command Palette
   ⌘⇧P  »  Extensions: Install Extension  »  "Pincast Expo"
   
   # Or via CLI
   cursor extension install pincast.expo
   ```

3. **Configure Project**
   ```bash
   # Initialize new project
   pincast init my-app
   
   # Install dependencies
   cd my-app
   pnpm install
   
   # Configure environment
   cp .env.example .env.pincast
   ```

### Project Structure

```
my-app/
├── src/
│   ├── components/
│   │   ├── LocationAware/
│   │   ├── Geofencing/
│   │   └── Analytics/
│   ├── composables/
│   │   ├── useLocation.ts
│   │   ├── useGeofence.ts
│   │   └── useAnalytics.ts
│   ├── types/
│   │   └── location.ts
│   └── utils/
│       └── geo.ts
├── tests/
│   ├── unit/
│   └── e2e/
├── .env.pincast
├── pincast.json
└── package.json
```

## Core Concepts

### Location Services

#### Basic Location Tracking

```typescript
const { location, startWatching, stopWatching } = usePincastLocation({
  enableHighAccuracy: true,
  timeout: 5000,
  maximumAge: 0
});

// Start tracking
onMounted(() => {
  startWatching();
});

// Clean up
onUnmounted(() => {
  stopWatching();
});
```

#### Advanced Location Features

```typescript
const {
  location,
  heading,
  speed,
  altitude,
  accuracy,
  timestamp,
  isTracking,
  hasPermission,
  requestPermission,
  calculateDistance,
  calculateBearing,
  isWithinRadius
} = usePincastLocation();

// Monitor heading changes
watch(() => heading.value, (newHeading) => {
  updateCompass(newHeading);
});

// Calculate distances
const distanceToTarget = calculateDistance(
  location.value,
  targetLocation,
  'haversine' // or 'vincenty' for more accuracy
);

// Check if within range
const isNearby = isWithinRadius(
  location.value,
  pointOfInterest,
  100 // meters
);
```

### Geofencing System

#### Simple Geofence

```typescript
const { createGeofence, checkGeofence } = usePincastGeofence();

// Create a circular geofence
const fence = createGeofence({
  id: 'store-entrance',
  center: { lat: 40.7128, lng: -74.0060 },
  radius: 50, // meters
  onEnter: () => console.log('Entered store area'),
  onExit: () => console.log('Left store area')
});

// Monitor geofence
watch(() => location.value, () => {
  checkGeofence(fence);
});
```

#### Complex Geofencing

```typescript
const { createPolygonGeofence, createMultiGeofence } = usePincastGeofence();

// Create polygon geofence
const parkBoundary = createPolygonGeofence({
  id: 'central-park',
  points: [
    { lat: 40.7829, lng: -73.9654 },
    { lat: 40.7735, lng: -73.9708 },
    { lat: 40.7648, lng: -73.9577 },
    { lat: 40.7681, lng: -73.9498 }
  ],
  events: {
    onEnter: handleParkEntry,
    onExit: handleParkExit,
    onDwell: handleLongStay
  }
});

// Create multi-geofence
const storeNetwork = createMultiGeofence({
  fences: [storeA, storeB, storeC],
  logic: 'ANY', // or 'ALL' for multiple conditions
  onMatch: handleStoreProximity
});
```

### Data Management

#### Basic Operations

```typescript
const { store, query, update, remove } = usePincastData('locations');

// Store location
await store({
  id: 'poi-1',
  name: 'Times Square',
  location: { lat: 40.7580, lng: -73.9855 }
});

// Query nearby
const nearby = await query({
  near: currentLocation,
  maxDistance: 1000,
  limit: 10
});

// Update record
await update('poi-1', {
  lastVisited: new Date()
});

// Remove record
await remove('poi-1');
```

#### Advanced Queries

```typescript
const { query, aggregate } = usePincastData('visits');

// Complex spatial query
const hotspots = await query({
  where: {
    category: 'restaurant',
    rating: { $gte: 4 },
    price: { $lte: 3 }
  },
  near: location.value,
  maxDistance: 2000,
  sort: {
    distance: 'asc',
    rating: 'desc'
  },
  limit: 20
});

// Aggregation
const visitStats = await aggregate([
  {
    $match: {
      timestamp: { $gte: lastWeek }
    }
  },
  {
    $group: {
      _id: '$locationId',
      visits: { $sum: 1 },
      avgDuration: { $avg: '$duration' }
    }
  }
]);
```

### Analytics Integration

#### User Tracking

```typescript
const { identify, track, page } = usePincastAnalytics();

// Identify user
identify(user.id, {
  email: user.email,
  name: user.name,
  plan: user.subscription,
  firstSeen: new Date()
});

// Track events
track('location_visited', {
  locationId: poi.id,
  category: poi.type,
  timeSpent: duration,
  actionsTaken: interactions
});

// Page views
page('location_details', {
  locationId: poi.id,
  referrer: previousPage
});
```

#### Advanced Analytics

```typescript
const {
  trackBatch,
  startSession,
  endSession,
  addProperties,
  clearProperties
} = usePincastAnalytics();

// Batch tracking
trackBatch([
  {
    event: 'route_started',
    properties: { routeId, startPoint }
  },
  {
    event: 'checkpoint_reached',
    properties: { checkpointId, timestamp }
  }
]);

// Session handling
startSession({
  deviceId,
  platform,
  osVersion,
  appVersion
});

// Global properties
addProperties({
  region: userRegion,
  language: userLanguage,
  deviceType: deviceInfo
});
```

## API Reference

### Location API

#### `usePincastLocation(options?: LocationOptions)`

Options:
```typescript
interface LocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  watchInterval?: number;
  backgroundTracking?: boolean;
}
```

Returns:
```typescript
interface LocationAPI {
  location: Ref<GeolocationCoordinates>;
  heading: Ref<number>;
  speed: Ref<number>;
  accuracy: Ref<number>;
  timestamp: Ref<number>;
  error: Ref<GeolocationError | null>;
  isWatching: Ref<boolean>;
  hasPermission: Ref<boolean>;
  
  // Methods
  getCurrentPosition(): Promise<GeolocationCoordinates>;
  startWatching(options?: WatchOptions): void;
  stopWatching(): void;
  requestPermission(): Promise<PermissionStatus>;
  
  // Calculations
  calculateDistance(start: Coordinates, end: Coordinates, method?: 'haversine' | 'vincenty'): number;
  calculateBearing(start: Coordinates, end: Coordinates): number;
  isWithinDistance(point: Coordinates, target: Coordinates, meters: number): boolean;
}
```

### Geofencing API

#### `usePincastGeofence(options?: GeofenceOptions)`

Options:
```typescript
interface GeofenceOptions {
  monitoring?: 'foreground' | 'background' | 'always';
  updateInterval?: number;
  batchUpdates?: boolean;
  errorThreshold?: number;
}
```

Returns:
```typescript
interface GeofenceAPI {
  // Creation
  createGeofence(config: CircularGeofenceConfig): Geofence;
  createPolygonGeofence(config: PolygonGeofenceConfig): PolygonGeofence;
  createMultiGeofence(config: MultiGeofenceConfig): MultiGeofence;
  
  // Monitoring
  startMonitoring(fenceId: string): void;
  stopMonitoring(fenceId: string): void;
  checkGeofence(fence: Geofence): GeofenceStatus;
  
  // Events
  onGeofenceEnter(handler: GeofenceEventHandler): void;
  onGeofenceExit(handler: GeofenceEventHandler): void;
  onGeofenceDwell(handler: GeofenceEventHandler): void;
}
```

### Data API

#### `usePincastData(collection: string, options?: DataOptions)`

Options:
```typescript
interface DataOptions {
  caching?: boolean;
  cacheDuration?: number;
  realtime?: boolean;
  compression?: boolean;
}
```

Returns:
```typescript
interface DataAPI {
  // Basic CRUD
  store(data: any): Promise<string>;
  get(id: string): Promise<any>;
  update(id: string, data: any): Promise<void>;
  remove(id: string): Promise<void>;
  
  // Queries
  query(params: QueryParams): Promise<any[]>;
  aggregate(pipeline: AggregatePipeline[]): Promise<any[]>;
  
  // Real-time
  subscribe(query: QueryParams, callback: SubscriptionCallback): Subscription;
  unsubscribe(subscription: Subscription): void;
}
```

### Analytics API

#### `usePincastAnalytics(options?: AnalyticsOptions)`

Options:
```typescript
interface AnalyticsOptions {
  batchSize?: number;
  flushInterval?: number;
  samplingRate?: number;
  errorHandling?: 'silent' | 'throw' | 'retry';
}
```

Returns:
```typescript
interface AnalyticsAPI {
  // User identification
  identify(userId: string, traits?: UserTraits): void;
  
  // Event tracking
  track(event: string, properties?: EventProperties): void;
  trackBatch(events: TrackEvent[]): void;
  
  // Session management
  startSession(metadata?: SessionMetadata): void;
  endSession(): void;
  
  // Properties
  addProperties(props: GlobalProperties): void;
  clearProperties(): void;
}
```

## Real-World Examples

### 1. Location-Based Scavenger Hunt

Create an engaging scavenger hunt experience where players need to visit specific locations to unlock clues:

```typescript
// scavenger-hunt.ts
import { usePincastLocation, usePincastData, usePincastAnalytics } from '@pincast/sdk';

export function useScavengerHunt() {
  const { location, isWithinDistance } = usePincastLocation();
  const { store, query } = usePincastData('hunt-progress');
  const { track } = usePincastAnalytics();
  
  // Define hunt locations
  const huntLocations = [
    { id: 1, name: 'Start Point', coords: { lat: 40.7829, lng: -73.9654 }, clue: 'Find the castle in the park...' },
    { id: 2, name: 'Bethesda Fountain', coords: { lat: 40.7735, lng: -73.9708 }, clue: 'Where angels watch over water...' },
    // More locations...
  ];
  
  // Check if player is at the correct location
  const checkLocation = async (locationId: number) => {
    const targetLocation = huntLocations.find(loc => loc.id === locationId);
    if (!targetLocation) return false;
    
    const isNearby = isWithinDistance(location.value, targetLocation.coords, 50); // 50 meters radius
    
    if (isNearby) {
      await store('completed-locations', {
        locationId,
        timestamp: new Date(),
        accuracy: location.value.accuracy
      });
      
      track('location_discovered', {
        locationId,
        timeTaken: calculateTimeTaken(locationId)
      });
      
      return true;
    }
    
    return false;
  };
  
  return {
    huntLocations,
    checkLocation,
    // ... more hunt functionality
  };
}
```

### 2. Real-Time Location-Based Chat

Create a chat application where messages only appear when users are within a specific radius:

```typescript
// proximity-chat.ts
import { ref, watch } from 'vue';
import { usePincastLocation, usePincastData } from '@pincast/sdk';

export function useProximityChat(radiusMeters: number = 100) {
  const { location, findNearbyItems } = usePincastLocation();
  const { store, query, subscribe } = usePincastData('chat-messages');
  
  const messages = ref([]);
  const nearbyUsers = ref([]);
  
  // Subscribe to real-time message updates
  subscribe('messages', (newMessage) => {
    const isInRange = isMessageInRange(newMessage);
    if (isInRange) {
      messages.value.push(newMessage);
    }
  });
  
  // Watch location changes to update visible messages
  watch(() => location.value, async () => {
    const allMessages = await query('messages', {
      timeRange: 'last24h',
      limit: 100
    });
    
    messages.value = findNearbyItems(allMessages, {
      maxDistance: radiusMeters,
      location: location.value
    });
    
    // Update nearby users
    nearbyUsers.value = await query('active-users', {
      near: location.value,
      maxDistance: radiusMeters
    });
  });
  
  // Send a new message
  const sendMessage = async (text: string) => {
    await store('messages', {
      text,
      location: location.value,
      timestamp: new Date(),
      author: {
        id: currentUser.value.id,
        name: currentUser.value.name
      }
    });
  };
  
  return {
    messages,
    nearbyUsers,
    sendMessage
  };
}
```

### 3. Location-Based AR Experience

Create an augmented reality experience that reveals content based on user location:

```typescript
// ar-experience.ts
import { usePincastLocation, usePincastData, usePincastAnalytics } from '@pincast/sdk';
import { useThreeJS } from '@/composables/three';

export function useARExperience() {
  const { location, heading, accuracy } = usePincastLocation();
  const { query } = usePincastData('ar-content');
  const { track } = usePincastAnalytics();
  const { scene, camera, renderer } = useThreeJS();
  
  // Load AR content based on location
  const loadNearbyContent = async () => {
    const content = await query('ar-content', {
      near: location.value,
      maxDistance: 100, // 100 meters
      sort: 'distance'
    });
    
    content.forEach(item => {
      const model = await loadARModel(item.modelUrl);
      positionInWorld(model, item.location, location.value);
      scene.add(model);
      
      track('ar_content_loaded', {
        contentId: item.id,
        distance: calculateDistance(location.value, item.location)
      });
    });
  };
  
  // Update AR content positions as user moves
  watch(() => location.value, () => {
    updateARPositions();
  });
  
  // Handle device orientation changes
  watch(() => heading.value, () => {
    updateCameraOrientation();
  });
  
  return {
    startAR,
    pauseAR,
    resumeAR,
    loadNearbyContent
  };
}
```

## Advanced Features

### AI-Powered Location Debugging

#### Intelligent Error Detection

```typescript
const { enableAIDebugging } = usePincastDebugger();

enableAIDebugging({
  // AI will analyze these patterns
  patterns: {
    accuracy: {
      threshold: 100, // meters
      action: 'suggest_recalibration'
    },
    movement: {
      minSpeed: 0.5, // m/s
      maxSpeed: 30, // m/s
      action: 'flag_anomaly'
    },
    battery: {
      threshold: 0.15,
      action: 'optimize_polling'
    }
  },
  
  // AI-powered error handlers
  handlers: {
    onAccuracyDrop: async (event) => {
      const suggestion = await AI.analyzeProblem(event);
      console.log(suggestion.fixes);
    },
    onAnomalousMovement: (event) => {
      AI.suggestFiltering(event.data);
    }
  }
});
```

#### Smart Testing

```typescript
const { createAITestScenario } = usePincastTesting();

// AI generates realistic test scenarios
const scenario = await createAITestScenario({
  type: 'user_journey',
  context: {
    startPoint: { lat: 40.7829, lng: -73.9654 },
    destination: { lat: 40.7580, lng: -73.9855 },
    transportMode: 'walking',
    timeOfDay: 'evening',
    weather: 'rainy'
  }
});

// Run AI-generated tests
await scenario.run({
  assertions: {
    locationUpdates: true,
    geofenceEvents: true,
    batteryImpact: true
  }
});
```

### Performance Optimization

#### Adaptive Location Polling

```typescript
const { createAdaptivePoller } = usePincastOptimization();

const poller = createAdaptivePoller({
  // AI tunes these parameters based on usage
  baseInterval: 1000,
  maxInterval: 30000,
  minInterval: 500,
  
  // AI-powered adaptation rules
  adaptationRules: {
    battery: {
      level: (battery) => battery < 0.2 ? 'increase_interval' : 'maintain',
      temperature: (temp) => temp > 35 ? 'increase_interval' : 'maintain'
    },
    movement: {
      speed: (speed) => speed > 10 ? 'decrease_interval' : 'maintain',
      pattern: (pattern) => pattern === 'stationary' ? 'increase_interval' : 'maintain'
    },
    accuracy: {
      required: (acc) => acc < 50 ? 'decrease_interval' : 'maintain'
    }
  }
});
```

#### Intelligent Caching

```typescript
const { createSmartCache } = usePincastOptimization();

const cache = createSmartCache({
  // AI-optimized caching strategies
  strategies: {
    locations: {
      type: 'spatial',
      radius: 1000, // meters
      maxAge: 3600, // seconds
      prefetch: true
    },
    routes: {
      type: 'predictive',
      confidence: 0.8,
      maxPaths: 3
    }
  },
  
  // AI-driven prefetching
  prefetchRules: {
    onLocationChange: async (location) => {
      const prediction = await AI.predictNextLocations(location);
      await cache.prefetch(prediction.locations);
    }
  }
});
```

### Security & Privacy

#### Location Data Protection

```typescript
const { createPrivacyGuard } = usePincastSecurity();

const guard = createPrivacyGuard({
  // AI-powered privacy rules
  rules: {
    precision: {
      default: 6, // decimal places
      trusted: 8,
      public: 4
    },
    exclusions: {
      type: 'geometric',
      shapes: [
        {
          type: 'circle',
          center: homeLocation,
          radius: 100
        },
        {
          type: 'polygon',
          points: workplaceArea
        }
      ]
    }
  },
  
  // AI-managed data lifecycle
  retention: {
    default: '30d',
    sensitive: '7d',
    temporary: '24h'
  }
});
```

#### Secure Data Transmission

```typescript
const { createSecureChannel } = usePincastSecurity();

const channel = createSecureChannel({
  // AI-optimized encryption
  encryption: {
    algorithm: 'AES-256-GCM',
    keyRotation: '7d',
    backup: true
  },
  
  // AI-powered threat detection
  monitoring: {
    patterns: ['anomalous_access', 'data_exfiltration', 'replay_attacks'],
    response: 'block_and_report'
  }
});
```

### Battery Efficiency

#### Smart Background Mode

```typescript
const { createPowerManager } = usePincastOptimization();

const powerManager = createPowerManager({
  // AI-optimized power modes
  modes: {
    high: {
      accuracy: 'best',
      interval: 1000,
      allowBackground: true
    },
    balanced: {
      accuracy: 'medium',
      interval: 5000,
      allowBackground: true
    },
    low: {
      accuracy: 'low',
      interval: 30000,
      allowBackground: false
    }
  },
  
  // AI-driven mode switching
  switching: {
    battery: (level) => level < 0.2 ? 'low' : level < 0.5 ? 'balanced' : 'high',
    activity: (type) => type === 'stationary' ? 'low' : 'balanced',
    time: (hour) => (hour >= 23 || hour <= 6) ? 'low' : 'balanced'
  }
});
```

## Best Practices

### Location Accuracy

1. **Use Appropriate Accuracy Levels**
   ```typescript
   const { location } = usePincastLocation({
     enableHighAccuracy: true, // Only when needed
     desiredAccuracy: {
       navigation: 5,  // meters
       tracking: 10,
       region: 100
     }
   });
   ```

2. **Implement Fallbacks**
   ```typescript
   const { createLocationFallback } = usePincastLocation();
   
   const fallback = createLocationFallback({
     strategies: ['gps', 'network', 'ip', 'manual'],
     timeout: 5000,
     onFallback: (strategy) => console.log(`Using ${strategy}`)
   });
   ```

### Error Handling

1. **Graceful Degradation**
   ```typescript
   const { createErrorHandler } = usePincastError();
   
   const handler = createErrorHandler({
     strategies: {
       PERMISSION_DENIED: () => requestPermissionWithContext(),
       POSITION_UNAVAILABLE: () => useFallbackLocation(),
       TIMEOUT: () => retryWithBackoff()
     }
   });
   ```

2. **User Communication**
   ```typescript
   const { createUserNotifier } = usePincastUI();
   
   const notifier = createUserNotifier({
     templates: {
       accuracy_low: "Location accuracy is low. Please move to an open area.",
       permission_needed: "This feature requires location access to work.",
       background_restricted: "Background location access is needed for tracking."
     }
   });
   ```

## Contributing

### Development Setup

1. **Clone Repository**
   ```bash
   git clone https://github.com/pincastfm/pincast-expo.git
   cd pincast-expo
   ```

2. **Install Dependencies**
   ```bash
   pnpm install
   ```

3. **Run Tests**
   ```bash
   pnpm test
   pnpm test:e2e
   ```

### Contribution Guidelines

1. **Code Style**
   - Follow TypeScript best practices
   - Use Vue.js Composition API
   - Document all public APIs
   - Write unit tests for new features

2. **Pull Request Process**
   - Create feature branch
   - Add tests
   - Update documentation
   - Submit PR with description

3. **Review Process**
   - Code review by maintainers
   - CI checks must pass
   - Documentation must be updated
   - Breaking changes must be noted

## License

MIT License - see [LICENSE](LICENSE) for details

## Support

- [GitHub Issues](https://github.com/pincastfm/pincast-expo/issues)
- [Documentation](https://docs.pincast.fm)
- [Discord Community](https://discord.gg/pincast)
- Email: support@pincast.fm

---

*Built with ❤️ by the Pincast team for Cursor AI*

---

*Built with ❤️ by the Pincast team* 