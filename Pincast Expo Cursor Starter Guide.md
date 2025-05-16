# Pincast Expo Cursor Starter Guide

This comprehensive guide will help you set up and use Pincast Expo for developing location-based applications in Cursor (VS Code).

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Installation](#installation)
4. [Project Setup](#project-setup)
5. [SDK Composables](#sdk-composables)
6. [Development Workflow](#development-workflow)
7. [Publishing](#publishing)
8. [Authentication & Authorization](#authentication--authorization)
9. [Data Storage](#data-storage)
10. [Analytics](#analytics)
11. [CLI Commands](#cli-commands)
12. [Troubleshooting](#troubleshooting)

## Overview

Pincast Expo enables you to build, test, and publish full-stack location-based experiences to the Pincast platform with just two commands:

```
⌘⇧P  »  Pincast: Enable Expo   # scaffolds SDK & auth
pincast deploy                 # builds + registers app (state=pending)
```

The platform consists of:
- **Cursor VS Code Extension**: Provides palette commands for enabling and publishing
- **@pincast/sdk**: Nuxt 3 composables for location, data, and analytics
- **pincast CLI**: Command-line tool for local development and deployment
- **Expo API**: Backend services for app registration and management

## Prerequisites

Before you begin, ensure you have:
- Node.js 18 or newer
- pnpm 8 or newer
- VS Code with Cursor extension installed
- Logto account for authentication

## Installation

### Option 1: VS Code Extension (Recommended)

1. Install the Pincast extension from the VS Code marketplace
2. Open your project in VS Code
3. Run the `Pincast: Enable Expo` command from the command palette (⌘⇧P)

### Option 2: CLI

1. Install the CLI globally:
   ```bash
   npm install -g pincast
   ```

2. Initialize your project:
   ```bash
   pincast init
   ```

## Project Setup

### Configuration Files

After initialization, the following files will be created:

1. `pincast.json` - Main configuration file:
   ```json
   {
     "title": "My Awesome App",
     "slug": "my-awesome-app",
     "geo": {
       "center": [-73.93, 40.72],
       "radiusMeters": 1500
     }
   }
   ```

2. `.env.pincast` - Environment variables:
   ```
   LOGTO_APP_ID=your-logto-app-id
   LOGTO_ENDPOINT=https://logto.pincast.fm
   CUSTOMERIO_SITE_ID=your-customerio-site-id
   CUSTOMERIO_API_KEY=your-customerio-api-key
   ```

### Folder Structure

The recommended project structure:
```
my-awesome-app/
├── .env.pincast            # Environment variables
├── pincast.json            # Configuration
├── nuxt.config.ts          # Nuxt config with SDK
├── app.vue                 # Main app component
├── composables/            # Custom composables
├── components/             # Vue components
└── pages/                  # Route pages
```

## SDK Composables

The SDK provides three main composables:

### 1. usePincastLocation

```javascript
const { 
  location,                // Current location data
  coords,                  // Latitude/longitude object
  accuracy,                // Accuracy in meters
  error,                   // Any location errors
  isWatching,              // Whether tracking is active
  getCurrentPosition,      // Get position once
  startWatching,           // Start continuous tracking
  stopWatching,            // Stop tracking
  distanceTo,              // Calculate distance to a point
  isWithinDistance,        // Check if within specified distance
  findNearbyItems          // Find nearby items in an array
} = usePincastLocation();
```

### 2. usePincastData

```javascript
const { 
  getAll,                  // Get all items in collection
  getById,                 // Get item by ID
  create,                  // Create a new item
  update,                  // Update an existing item
  remove,                  // Delete an item
  near,                    // Find items near a location
  query,                   // Advanced querying
  store                    // Create or update (upsert)
} = usePincastData('collection-name');
```

### 3. usePincastAnalytics

```javascript
const { 
  track,                   // Track custom event
  identify,                // Identify a user
  pageView,                // Track page view event
  sessionStart,            // Track session start
  flush                    // Force send queued events
} = usePincastAnalytics();
```

## Development Workflow

1. **Initialize your project** using the VS Code extension or CLI
2. **Start local development** server:
   ```bash
   pincast dev
   ```
3. **Build your app** using the SDK composables
4. **Test locally** with the built-in proxy server
5. **Deploy** to Pincast when ready

### Example Component

```vue
<script setup>
import { ref, onMounted, watch } from 'vue';
import { usePincastLocation, usePincastData } from '@pincast/sdk';

// Get location services
const { location, startWatching, findNearbyItems } = usePincastLocation();

// Get data services for the 'points' collection
const { getAll, near, store } = usePincastData('points');

// Local state
const points = ref([]);
const nearbyPoints = ref([]);

// Start location tracking on mount
onMounted(async () => {
  startWatching();
  
  // Load all points
  points.value = await getAll();
});

// Watch for location changes
watch(() => location.value, async () => {
  // Find points within 500 meters of current location
  nearbyPoints.value = await near(location.value, 500);
});

// Add a new point at current location
const addCurrentLocationPoint = async () => {
  const newPoint = {
    name: 'New Point',
    latitude: location.value.latitude, 
    longitude: location.value.longitude
  };
  
  const result = await store(newPoint);
  points.value.push(result);
};
</script>

<template>
  <div>
    <h1>My Location App</h1>
    
    <div class="location-info">
      <p>Latitude: {{ location.latitude }}</p>
      <p>Longitude: {{ location.longitude }}</p>
      <p>Accuracy: {{ location.accuracy }}m</p>
    </div>
    
    <button @click="addCurrentLocationPoint">
      Add Point at Current Location
    </button>
    
    <h2>Nearby Points ({{ nearbyPoints.length }})</h2>
    <ul>
      <li v-for="point in nearbyPoints" :key="point.id">
        {{ point.name }} - {{ point.distance }}m away
      </li>
    </ul>
  </div>
</template>
```

## Publishing

When your app is ready for publication:

1. **From VS Code**: Run the `Pincast: Publish to Marketplace` command
2. **From CLI**:
   ```bash
   pincast deploy
   ```

The deploy process:
1. Builds your Nuxt app for production
2. Uploads assets to Pincast servers
3. Registers the app with metadata from `pincast.json`
4. Returns a dashboard link for tracking approval status

Apps start in `pending` state until approved by Pincast staff.

## Authentication & Authorization

### Roles

The platform has three user roles:
- **player**: Default role for app users
- **developer**: For app creators (can submit apps)
- **staff**: Pincast team (can approve/reject apps)

### Authentication Flow

1. **Developer authentication**:
   - Via `pincast login` or VS Code extension
   - Uses OAuth device flow with Logto
   - Tokens stored in `~/.pincast/config.json`

2. **Player authentication**:
   - Handled by the SDK via Logto
   - Players authenticate once and can access all approved apps
   - App access is scoped with JWT tokens (aud=app:{id})

## Data Storage

Data is stored in a PostgreSQL database with PostGIS for geospatial features:

- **Key-value storage**: Each app has namespaced collections
- **GeoJSON support**: Store and query location data efficiently
- **Automatic namespacing**: Collections are isolated per app

## Analytics

The SDK integrates with Customer.io for analytics:

- **Automatic event tracking**: Sessions, pageviews, location events
- **Custom events**: Track any app-specific events
- **User identification**: Associate events with player accounts
- **Batched sending**: Events are batched for efficiency

## CLI Commands

```bash
# Initialize a new or existing project
pincast init

# Start local development server with proxy
pincast dev

# Authenticate with Pincast platform
pincast login

# Deploy app to Pincast marketplace
pincast deploy [--prod]

# Create a new project from template
pincast create <project-name>
```

## Troubleshooting

### Common Issues

1. **SDK not initialized**:
   - Ensure Nuxt module is properly registered in nuxt.config.ts
   - Check that `.env.pincast` exists with correct credentials

2. **Location not working**:
   - Verify browser permissions for geolocation
   - Ensure device has GPS enabled
   - Try refreshing the page

3. **Authentication errors**:
   - Run `pincast login` to refresh tokens
   - Check Logto configuration in `.env.pincast`

4. **Deployment failures**:
   - Verify your app builds correctly with `nuxt build`
   - Check network connectivity
   - Ensure `pincast.json` is correctly formatted

### Getting Help

- Open an issue on the GitHub repository
- Contact Pincast support at support@pincast.fm
- Check documentation at https://docs.pincast.fm