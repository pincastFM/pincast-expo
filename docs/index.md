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

## What is Pincast Expo for Cursor AI?

Pincast Expo is a powerful extension designed specifically for Cursor AI that enables developers to create immersive location-based experiences with the help of AI-powered code generation and real-time location services. By leveraging Cursor AI's advanced code understanding capabilities, Pincast Expo makes it easier than ever to build, test, and deploy location-aware applications.

### Why Cursor AI?

- **AI-Powered Development**: Leverage Cursor AI's advanced code understanding to auto-complete location-based logic
- **Contextual Awareness**: The extension understands your codebase and suggests relevant location features
- **Smart Debugging**: AI-assisted debugging for common location-based issues
- **Intelligent Code Generation**: Generate boilerplate code for common location patterns

## Quick Start with Cursor AI

```bash
# 1. Install Cursor AI from https://cursor.sh

# 2. Install the Pincast Expo extension from Cursor's marketplace
⌘⇧P  »  Extensions: Install Extension  »  "Pincast Expo"

# 3. Enable Pincast in your project
⌘⇧P  »  Pincast: Enable Expo

# 4. Deploy your app
pincast deploy
```

## Features

- 🤖 **AI-Powered Development**: Seamless integration with Cursor AI's code generation capabilities
- 🌍 **Location-Based Development**: Build experiences tied to real-world locations
- 🚀 **Rapid Deployment**: Deploy directly from Cursor AI with a single command
- 📱 **Cross-Platform**: Works seamlessly on iOS, Android, and web browsers
- 🔒 **Built-in Auth**: Integrated authentication and authorization with Logto
- 📊 **Analytics**: Automatic event tracking and custom analytics via Customer.io
- 🗺️ **Geospatial Data**: PostGIS-powered location queries and storage
- 🛠️ **Developer Tools**: Rich debugging and testing tools built into Cursor AI

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

## Advanced Features with Cursor AI

### AI-Powered Location Debugging

Cursor AI can help identify and fix common location-based issues:

```typescript
// Example of Cursor AI suggesting location accuracy improvements
const { location, accuracy } = usePincastLocation({
  enableHighAccuracy: true,  // Cursor AI: Recommended for precise location tracking
  maxAge: 5000,             // Cursor AI: Adjust based on your use case
  timeout: 10000            // Cursor AI: Increase for better accuracy
});

// Cursor AI can help implement smart error handling
const handleLocationError = (error: GeolocationError) => {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      // Cursor AI: Suggest enabling location services
      break;
    case error.POSITION_UNAVAILABLE:
      // Cursor AI: Implement fallback positioning
      break;
    case error.TIMEOUT:
      // Cursor AI: Retry with adjusted parameters
      break;
  }
};
```

### Smart Geofencing with AI

Leverage Cursor AI to generate optimal geofencing strategies:

```typescript
// Cursor AI can help optimize geofence parameters
const useSmartGeofence = (options: GeofenceOptions) => {
  const { location } = usePincastLocation();
  const { store } = usePincastData('geofence-events');
  
  // Cursor AI suggests optimal buffer zones based on accuracy
  const calculateBuffer = (accuracy: number) => {
    return Math.max(accuracy * 1.5, options.minBuffer);
  };
  
  // AI-powered geofence breach detection
  const checkGeofenceBreach = (fence: Geofence) => {
    const buffer = calculateBuffer(location.value.accuracy);
    const distance = calculateDistance(location.value, fence.center);
    
    return {
      isBreached: distance <= (fence.radius + buffer),
      confidence: calculateConfidence(distance, buffer, fence.radius)
    };
  };
  
  return {
    checkGeofenceBreach,
    // ... more geofencing functionality
  };
};
```

## Development Workflow in Cursor AI

1. **Initialize Project with AI Assistance**
   ```bash
   # Cursor AI will help set up your project structure
   pincast init my-app
   cd my-app
   ```

2. **AI-Powered Configuration**
   - Cursor AI helps configure `pincast.json` for optimal settings
   - Suggests environment variables in `.env.pincast`

3. **Develop with AI Support**
   ```bash
   # Start development server with AI-powered debugging
   pincast dev
   ```

4. **AI-Assisted Testing**
   - Use Cursor AI's built-in location simulator
   - Test geofencing with AI-generated test scenarios
   - Debug with AI-enhanced Chrome DevTools

5. **Deploy with Confidence**
   ```bash
   # AI verifies deployment readiness
   pincast deploy
   ```

## Best Practices (AI-Enhanced)

1. **Location Accuracy**
   - Use AI to determine optimal accuracy settings
   - Implement smart fallbacks for poor GPS signals
   - Balance accuracy with battery life

2. **Performance Optimization**
   - AI-powered background location updates
   - Smart caching of location data
   - Efficient geospatial queries

3. **Battery Efficiency**
   - AI-driven adaptive location polling
   - Smart background mode handling
   - Optimized geofencing calculations

## Troubleshooting with AI

### Common Issues

1. **SDK Initialization Failed**
   - AI-powered configuration verification
   - Automatic dependency checking
   - Smart environment validation

2. **Location Services Error**
   - AI-assisted permission debugging
   - Device-specific troubleshooting
   - Automatic error recovery suggestions

3. **Deployment Issues**
   - AI-powered deployment validation
   - Automatic error detection
   - Smart rollback suggestions

### Support

- [GitHub Issues](https://github.com/pincastfm/pincast-expo/issues)
- [Documentation](https://docs.pincast.fm)
- Email: support@pincast.fm

## Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## License

MIT License - see [LICENSE](LICENSE) for details

---

*Built with ❤️ by the Pincast team for Cursor AI*

---

*Built with ❤️ by the Pincast team* 