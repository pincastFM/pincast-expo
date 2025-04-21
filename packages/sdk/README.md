# @pincast/sdk

SDK for building Pincast Expo applications. This package provides Vue composables and utilities for building location-based experiences on the Pincast platform.

## Quick Start

### Install with Cursor Extension

The easiest way to get started is to use the Pincast Cursor extension:

1. Open your project in VS Code with Cursor
2. Press `⌘⇧P` and search for "Pincast: Enable Expo"
3. Follow the prompts to scaffold your project

### Manual Installation

```bash
# Install the SDK
npm install @pincast/sdk

# Add to your Nuxt configuration
# nuxt.config.ts
export default defineNuxtConfig({
  modules: [
    '@pincast/sdk'
  ],
  pincast: {
    apiBase: 'https://api.pincast.fm' // or process.env.PINCAST_API_BASE
  }
})
```

### Usage in a Nuxt application

Once installed, you can use the composables anywhere in your Nuxt app:

```vue
<script setup>
import { usePincastAuth, usePincastLocation, usePincastData } from '@pincast/sdk';

// Authentication
const { player, signIn } = usePincastAuth();

// Location
const { coords, getCurrentPosition } = usePincastLocation();
onMounted(() => {
  getCurrentPosition(); // Fetch current location when component mounts
});

// Data API
const todos = usePincastData('todos');
const items = ref([]);
onMounted(async () => {
  items.value = await todos.getAll();
});
</script>

<template>
  <div>
    <pre>User: {{ player }}</pre>
    <pre>Location: {{ coords }}</pre>
    <button @click="signIn()">Sign In</button>
  </div>
</template>
```

## Features

### Authentication

The SDK wraps Logto authentication to provide a seamless authentication experience:

```typescript
import { usePincastAuth } from '@pincast/sdk'

const auth = usePincastAuth()

// Sign in
await auth.signIn()

// Check if authenticated
if (auth.isAuthenticated.value) {
  console.log('User is authenticated')
  console.log('User ID:', auth.player.value.id)
  console.log('User role:', auth.role.value)
}

// Sign out
await auth.signOut()
```

### Location

Access device location and perform geospatial calculations:

```typescript
import { usePincastLocation } from '@pincast/sdk'

const location = usePincastLocation()

// Get current position
await location.getCurrentPosition()

// Access reactive location
console.log('Current coordinates:', location.coords.value)

// Calculate distance to another point
const distanceMeters = location.distanceTo({
  latitude: 40.7128,
  longitude: -74.006
})

// Find nearby points of interest
const nearbyPOIs = location.findNearbyItems(pointsOfInterest, 1000) // Within 1km
```

### Data Storage

Store and retrieve data from the Pincast platform:

```typescript
import { usePincastData } from '@pincast/sdk'

// Get the data API for a specific collection
const itemsData = usePincastData('items')

// Create a new item
const newItem = await itemsData.create({
  name: 'Test Item',
  description: 'This is a test item'
})

// Get all items
const allItems = await itemsData.getAll()

// Query items
const filteredItems = await itemsData.query({
  limit: 10,
  sort: 'createdAt'
})

// Get items near the current location
import { usePincastLocation } from '@pincast/sdk'
const location = usePincastLocation()
const nearbyItems = await itemsData.near(location.coords.value, 1000) // Within 1km
```

### Analytics

Track events and user interactions:

```typescript
import { usePincastAnalytics } from '@pincast/sdk'

const analytics = usePincastAnalytics()

// Track an event
await analytics.track('item_viewed', {
  item_id: '123',
  item_name: 'Test Item'
})

// Track a page view
await analytics.pageView('/items/123')

// Identify a user with custom traits
await analytics.identify('user123', {
  plan_level: 'premium'
})
```

## Plugin API

The SDK also exposes a Vue plugin that you can access in your components:

```typescript
// Access directly from the nuxt app
const { $pincast } = useNuxtApp()

// Use the SDK
$pincast.auth.signIn()
$pincast.data('items').getAll()
$pincast.analytics.track('event_name')
```

## Building and Deploying

Use the Pincast CLI to build and deploy your app:

```bash
# Install the CLI
npm install -g pincast

# Deploy your app
pincast deploy
```

## Development

```bash
# Install dependencies
pnpm install

# Build the SDK
pnpm build

# Run tests
pnpm test
```