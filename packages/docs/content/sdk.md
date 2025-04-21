---
title: Pincast SDK
description: A comprehensive guide to the Pincast SDK composables for authentication, location, data management, and analytics
---

# Pincast SDK

The Pincast SDK is a collection of Vue composables designed for building location-based experiences with Nuxt 3. It provides easy-to-use interfaces for authentication, location tracking, data management, and analytics.

## Installation

The SDK is automatically included when you create a project with `pincast create` or add Pincast to an existing project with `pincast init`. However, if you need to install it manually:

```bash
# npm
npm install @pincast/sdk pinia @pinia/nuxt

# yarn
yarn add @pincast/sdk pinia @pinia/nuxt

# pnpm
pnpm add @pincast/sdk pinia @pinia/nuxt
```

Then add it to your `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  modules: [
    '@pincast/sdk',
    '@pinia/nuxt'
  ]
})
```

## Core Composables

The SDK provides four main composables:

| Composable | Purpose | Features |
|------------|---------|----------|
| `useAuth()` | Authentication | Login, logout, user data, tokens |
| `usePincastLocation()` | Geolocation | Position tracking, distance calculation |
| `usePincastData()` | Data storage | Key-value storage, collections, GeoJSON |
| `useAnalytics()` | Event tracking | User events, sessions, metrics |

## Authentication - `useAuth()`

The `useAuth` composable provides authentication functionality via Logto:

```typescript
<script setup>
import { useAuth } from '@pincast/sdk'

// Initialize auth
const auth = useAuth()

// Reactive state
const isAuthenticated = computed(() => auth.isAuthenticated.value)
const userData = computed(() => auth.userData.value)

// Methods
function login() {
  auth.login()
}

function logout() {
  auth.logout()
}
</script>
```

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `isAuthenticated` | `Ref<boolean>` | Whether the user is currently authenticated |
| `isLoading` | `Ref<boolean>` | Whether auth is currently being loaded or checked |
| `userData` | `Ref<UserData \| null>` | User profile data if authenticated |
| `token` | `Ref<string \| null>` | Current JWT token if authenticated |

### Methods

| Method | Description | Returns |
|--------|-------------|---------|
| `login()` | Redirect to login page | `void` |
| `logout()` | Sign out the current user | `void` |
| `getToken()` | Get the current auth token | `Promise<string \| null>` |
| `refreshToken()` | Force a token refresh | `Promise<string \| null>` |

## Location - `usePincastLocation()`

The `usePincastLocation` composable provides geolocation functionality:

```typescript
<script setup>
import { usePincastLocation } from '@pincast/sdk'

// Initialize location tracking
const location = usePincastLocation()

// Start tracking location
location.startWatching()

// Reactive state
const currentPosition = computed(() => location.position.value)
const errorMessage = computed(() => location.error.value)

// Calculate distance to a point
const distanceToPoint = computed(() => {
  if (!currentPosition.value) return null
  
  return location.calculateDistance(
    currentPosition.value.coords.latitude,
    currentPosition.value.coords.longitude,
    37.7749, // Target latitude
    -122.4194 // Target longitude
  )
})

// Stop tracking when component is unmounted
onUnmounted(() => {
  location.stopWatching()
})
</script>
```

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `position` | `Ref<GeolocationPosition \| null>` | Current user position |
| `error` | `Ref<string \| null>` | Error message if geolocation fails |
| `isWatching` | `Ref<boolean>` | Whether location is being actively tracked |

### Methods

| Method | Description | Returns |
|--------|-------------|---------|
| `startWatching(options?)` | Begin tracking location | `void` |
| `stopWatching()` | Stop tracking location | `void` |
| `getCurrentPosition(options?)` | Get position once | `Promise<GeolocationPosition>` |
| `calculateDistance(lat1, lon1, lat2, lon2)` | Calculate distance between two points in meters | `number` |

## Data - `usePincastData()`

The `usePincastData` composable provides data storage functionality:

```typescript
<script setup>
import { usePincastData } from '@pincast/sdk'

// Initialize data store
const dataStore = usePincastData()

// Reactive refs
const playerProgress = ref({
  level: 1,
  score: 0,
  checkpoints: []
})

// Save data
async function saveProgress() {
  await dataStore.set('player_progress', playerProgress.value)
}

// Load data
async function loadProgress() {
  const data = await dataStore.get('player_progress')
  if (data) {
    playerProgress.value = data
  }
}

// Call loadProgress when component is mounted
onMounted(loadProgress)

// Collection operations
async function saveCheckpoint(checkpoint) {
  // Add to collection
  const id = await dataStore.collection('checkpoints').add({
    position: {
      lat: checkpoint.lat,
      lng: checkpoint.lng
    },
    timestamp: new Date(),
    found: true
  })
  
  // Add to local state
  playerProgress.value.checkpoints.push({
    id,
    ...checkpoint
  })
  
  // Save overall progress
  await saveProgress()
}
</script>
```

### Methods

| Method | Description | Returns |
|--------|-------------|---------|
| `get(key)` | Get a stored value by key | `Promise<any \| null>` |
| `set(key, value)` | Store a value by key | `Promise<void>` |
| `remove(key)` | Delete a stored value | `Promise<void>` |
| `collection(name)` | Get a collection interface | `CollectionInterface` |

### Collection Interface

| Method | Description | Returns |
|--------|-------------|---------|
| `get(id)` | Get document by ID | `Promise<any \| null>` |
| `getAll()` | Get all documents | `Promise<any[]>` |
| `add(data)` | Add a new document | `Promise<string>` (new ID) |
| `update(id, data)` | Update a document | `Promise<void>` |
| `remove(id)` | Delete a document | `Promise<void>` |
| `query(filters)` | Query documents | `Promise<any[]>` |

## Analytics - `useAnalytics()`

The `useAnalytics` composable provides event tracking functionality:

```typescript
<script setup>
import { useAnalytics } from '@pincast/sdk'

// Initialize analytics
const analytics = useAnalytics()

// Track a simple event
function onStartQuest() {
  analytics.trackEvent('quest_started')
}

// Track an event with properties
function onCompleteCheckpoint(checkpointId, timeSpent) {
  analytics.trackEvent('checkpoint_completed', {
    checkpoint_id: checkpointId,
    time_spent: timeSpent,
    coordinates: {
      lat: 37.7749,
      lng: -122.4194
    }
  })
}

// Track a user property
function setUserDifficulty(level) {
  analytics.setUserProperty('difficulty_level', level)
}
</script>
```

### Methods

| Method | Description | Returns |
|--------|-------------|---------|
| `trackEvent(name, properties?)` | Track an event with optional properties | `Promise<void>` |
| `setUserProperty(key, value)` | Set a user property | `Promise<void>` |
| `identify(userId, traits?)` | Identify a user with optional traits | `Promise<void>` |
| `screen(name, properties?)` | Track a screen view | `Promise<void>` |

## Configuration

The SDK's behavior can be configured in your `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  modules: ['@pincast/sdk'],
  pincast: {
    auth: {
      redirectUri: '/callback',
      postLogoutRedirectUri: '/'
    },
    location: {
      watchOptions: {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000
      }
    },
    analytics: {
      autoTrack: true
    }
  }
})
```

## TypeScript Support

The Pincast SDK includes TypeScript definitions for all composables and interfaces:

```typescript
import { UserData, GeolocationOptions, AnalyticsEvent } from '@pincast/sdk'

// Type for checkpoint data
interface Checkpoint {
  id: string
  name: string
  position: {
    lat: number
    lng: number
  }
  found: boolean
  timestamp?: Date
}

// Use in components with type safety
const checkpoints = ref<Checkpoint[]>([])
```

## Full Example

Here's a complete example of using all SDK features in a Vue component:

```vue
<template>
  <div>
    <div v-if="!auth.isAuthenticated">
      <h2>Please log in to continue</h2>
      <button @click="auth.login">Login</button>
    </div>
    
    <div v-else>
      <h2>Welcome, {{ auth.userData?.name }}</h2>
      
      <div v-if="location.position">
        <p>Your location: {{ formatLocation(location.position) }}</p>
        
        <div v-for="checkpoint in nearbyCheckpoints" :key="checkpoint.id">
          <h3>{{ checkpoint.name }}</h3>
          <p>Distance: {{ formatDistance(checkpoint.distance) }}</p>
          <button 
            v-if="checkpoint.distance < 20 && !checkpoint.found" 
            @click="discoverCheckpoint(checkpoint)"
          >
            Discover
          </button>
        </div>
      </div>
      
      <div v-else-if="location.error">
        <p>Error getting location: {{ location.error }}</p>
      </div>
      
      <div v-else>
        <p>Getting your location...</p>
      </div>
      
      <button @click="saveProgress">Save Progress</button>
      <button @click="auth.logout">Logout</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuth, usePincastLocation, usePincastData, useAnalytics } from '@pincast/sdk'

// Initialize composables
const auth = useAuth()
const location = usePincastLocation()
const dataStore = usePincastData()
const analytics = useAnalytics()

// Game state
const checkpoints = ref([
  {
    id: 'cp1',
    name: 'Start Point',
    position: { lat: 37.7749, lng: -122.4194 },
    found: false
  },
  {
    id: 'cp2',
    name: 'Hidden Treasure',
    position: { lat: 37.7751, lng: -122.4191 },
    found: false
  },
  {
    id: 'cp3',
    name: 'Final Destination',
    position: { lat: 37.7748, lng: -122.4189 },
    found: false
  }
])

// Calculate distances to checkpoints
const nearbyCheckpoints = computed(() => {
  if (!location.position?.value) return []
  
  const { latitude, longitude } = location.position.value.coords
  
  return checkpoints.value.map(checkpoint => ({
    ...checkpoint,
    distance: location.calculateDistance(
      latitude,
      longitude,
      checkpoint.position.lat,
      checkpoint.position.lng
    )
  })).sort((a, b) => a.distance - b.distance)
})

// Format location for display
function formatLocation(position) {
  const { latitude, longitude } = position.coords
  return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
}

// Format distance for display
function formatDistance(meters) {
  if (meters < 1000) {
    return `${Math.round(meters)}m`
  } else {
    return `${(meters / 1000).toFixed(2)}km`
  }
}

// Discover checkpoint
function discoverCheckpoint(checkpoint) {
  // Update local state
  const idx = checkpoints.value.findIndex(cp => cp.id === checkpoint.id)
  if (idx >= 0) {
    checkpoints.value[idx].found = true
    checkpoints.value[idx].discoveredAt = new Date()
  }
  
  // Save to data store
  dataStore.collection('discovered_checkpoints').add({
    checkpointId: checkpoint.id,
    timestamp: new Date(),
    position: {
      lat: location.position.value.coords.latitude,
      lng: location.position.value.coords.longitude
    }
  })
  
  // Track analytics event
  analytics.trackEvent('checkpoint_discovered', {
    checkpoint_id: checkpoint.id,
    checkpoint_name: checkpoint.name
  })
}

// Save game progress
async function saveProgress() {
  await dataStore.set('game_progress', {
    checkpoints: checkpoints.value,
    lastSaved: new Date()
  })
  
  analytics.trackEvent('progress_saved')
}

// Load saved progress
async function loadProgress() {
  const progress = await dataStore.get('game_progress')
  if (progress) {
    checkpoints.value = progress.checkpoints
  }
}

// Component lifecycle
onMounted(async () => {
  // Start tracking location
  location.startWatching()
  
  // Load saved data if authenticated
  if (auth.isAuthenticated.value) {
    await loadProgress()
    analytics.trackEvent('game_resumed')
  }
})

onUnmounted(() => {
  // Stop tracking location
  location.stopWatching()
})
</script>
```