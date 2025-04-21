---
title: Build a Location-Based Quest
description: Create an interactive quest with multiple checkpoints using Pincast Expo
---

# Build a Location-Based Quest

In this tutorial, we'll create a complete location-based quest app called "Zombie Run" where players navigate through the city, finding checkpoints while avoiding zombie-infested areas.

## What We'll Build

By the end of this tutorial, you'll have a fully functional quest application with:

- Interactive map with player location tracking
- Multiple checkpoints that players must discover
- Danger zones to avoid (zombie-infested areas)
- Progress tracking and persistence
- Achievements for completing the quest

<div class="my-8">
  <img src="/tutorial-quest-preview.png" alt="Zombie Run Quest Preview" class="w-full rounded-lg border border-gray-200 dark:border-gray-700" />
</div>

## Prerequisites

Before starting, make sure you have:

- Node.js 18 or higher installed
- VS Code or Cursor editor
- Pincast Expo extension installed
- Mapbox account (for access token)

## Step 1: Create a New Project

Let's start by creating a new Pincast project:

```bash
pincast create zombie-run
cd zombie-run
```

Edit the `.env` file to add your Mapbox access token:

```env
MAPBOX_ACCESS_TOKEN=your_mapbox_token_here
```

## Step 2: Define Quest Data

Create a new file `composables/useQuestData.ts` to store our quest data:

```typescript
import { ref } from 'vue'
import { usePincastData } from '@pincast/sdk'

export interface Checkpoint {
  id: string
  name: string
  description: string
  latitude: number
  longitude: number
  found: boolean
  requiredOrder: number | null
  imageUrl?: string
}

export interface DangerZone {
  id: string
  name: string
  latitude: number
  longitude: number
  radiusMeters: number
}

export function useQuestData() {
  const dataStore = usePincastData()
  
  // Checkpoint definitions
  const checkpoints = ref<Checkpoint[]>([
    {
      id: 'start',
      name: 'Safe Zone Alpha',
      description: 'The last known safe area. Start your journey here.',
      latitude: 40.7128, // NYC latitude (replace with your coordinates)
      longitude: -74.0060, // NYC longitude
      found: false,
      requiredOrder: 1,
      imageUrl: '/checkpoints/safe-zone.jpg'
    },
    {
      id: 'medical',
      name: 'Medical Supplies',
      description: 'Find medical supplies in the abandoned hospital.',
      latitude: 40.7138, // Adjust for your location
      longitude: -74.0050,
      found: false,
      requiredOrder: 2,
      imageUrl: '/checkpoints/medical.jpg'
    },
    {
      id: 'weapons',
      name: 'Weapon Cache',
      description: 'Locate the hidden weapon cache to defend yourself.',
      latitude: 40.7120,
      longitude: -74.0065,
      found: false,
      requiredOrder: 3,
      imageUrl: '/checkpoints/weapons.jpg'
    },
    {
      id: 'extraction',
      name: 'Extraction Point',
      description: 'Reach the helicopter extraction point to complete your mission.',
      latitude: 40.7135,
      longitude: -74.0080,
      found: false,
      requiredOrder: 4,
      imageUrl: '/checkpoints/extraction.jpg'
    }
  ])
  
  // Danger zones (zombie-infested areas)
  const dangerZones = ref<DangerZone[]>([
    {
      id: 'zone1',
      name: 'Downtown Horde',
      latitude: 40.7125,
      longitude: -74.0055,
      radiusMeters: 100
    },
    {
      id: 'zone2',
      name: 'Subway Infestation',
      latitude: 40.7140,
      longitude: -74.0070,
      radiusMeters: 80
    }
  ])
  
  // Load saved progress
  const loadProgress = async () => {
    const savedProgress = await dataStore.get('quest_progress')
    if (savedProgress) {
      checkpoints.value = checkpoints.value.map(checkpoint => {
        const savedCheckpoint = savedProgress.checkpoints.find(
          (cp: Checkpoint) => cp.id === checkpoint.id
        )
        return savedCheckpoint ? { ...checkpoint, found: savedCheckpoint.found } : checkpoint
      })
    }
  }
  
  // Save progress
  const saveProgress = async () => {
    await dataStore.set('quest_progress', {
      checkpoints: checkpoints.value,
      lastSaved: new Date()
    })
  }
  
  // Check if all checkpoints are found
  const isQuestComplete = computed(() => {
    return checkpoints.value.every(checkpoint => checkpoint.found)
  })
  
  // Get next checkpoint to find
  const nextCheckpoint = computed(() => {
    const notFound = checkpoints.value
      .filter(checkpoint => !checkpoint.found)
      .sort((a, b) => {
        if (a.requiredOrder === null) return 1
        if (b.requiredOrder === null) return -1
        return a.requiredOrder - b.requiredOrder
      })
      
    return notFound.length > 0 ? notFound[0] : null
  })
  
  return {
    checkpoints,
    dangerZones,
    loadProgress,
    saveProgress,
    isQuestComplete,
    nextCheckpoint
  }
}
```

## Step 3: Create the Quest Map Component

Now, let's create the map component that will display the player's location, checkpoints, and danger zones.

Create a new component file `components/QuestMap.vue`:

```vue
<template>
  <div class="map-container">
    <div id="map" ref="mapElement"></div>
    
    <div class="map-controls">
      <button 
        @click="centerOnPlayer" 
        class="control-button"
        title="Center on your location"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>
      </button>
    </div>
    
    <div v-if="inDanger" class="danger-alert">
      <span>⚠️ DANGER: {{ currentDangerZone.name }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { usePincastLocation } from '@pincast/sdk'
import mapboxgl from 'mapbox-gl'
import type { Checkpoint, DangerZone } from '~/composables/useQuestData'

const props = defineProps({
  checkpoints: {
    type: Array as () => Checkpoint[],
    required: true
  },
  dangerZones: {
    type: Array as () => DangerZone[],
    required: true
  }
})

const emit = defineEmits(['checkpoint-discovered'])

// Get runtime config for Mapbox
const config = useRuntimeConfig()

// Initialize location tracking
const location = usePincastLocation()

// Map references
const mapElement = ref<HTMLElement | null>(null)
let map: mapboxgl.Map | null = null
let playerMarker: mapboxgl.Marker | null = null
const checkpointMarkers: { [id: string]: mapboxgl.Marker } = {}
const dangerZoneCircles: { [id: string]: mapboxgl.CircleLayer } = {}

// Danger state
const inDanger = ref(false)
const currentDangerZone = ref<DangerZone | null>(null)

// Center map on player
function centerOnPlayer() {
  if (map && location.position.value) {
    const { longitude, latitude } = location.position.value.coords
    map.flyTo({
      center: [longitude, latitude],
      zoom: 16
    })
  }
}

// Initialize map when component is mounted
onMounted(() => {
  // Start watching player location
  location.startWatching({
    enableHighAccuracy: true,
    maximumAge: 0,
    timeout: 5000
  })
  
  // Set Mapbox token
  mapboxgl.accessToken = config.public.mapboxAccessToken
  
  if (mapElement.value) {
    // Create map
    map = new mapboxgl.Map({
      container: mapElement.value,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [-74.0060, 40.7128], // NYC (or your default location)
      zoom: 14
    })
    
    // Add navigation control
    map.addControl(new mapboxgl.NavigationControl(), 'top-right')
    
    // Add player marker when map loads
    map.on('load', () => {
      // Create player marker
      const el = document.createElement('div')
      el.className = 'player-marker'
      
      playerMarker = new mapboxgl.Marker({
        element: el,
        anchor: 'center'
      })
        .setLngLat([-74.0060, 40.7128])
        .addTo(map!)
      
      // Add checkpoint markers
      addCheckpointMarkers()
      
      // Add danger zones
      addDangerZones()
    })
  }
})

// Add checkpoint markers to the map
function addCheckpointMarkers() {
  if (!map) return
  
  props.checkpoints.forEach(checkpoint => {
    // Create custom marker element
    const el = document.createElement('div')
    el.className = checkpoint.found 
      ? 'checkpoint-marker checkpoint-found' 
      : 'checkpoint-marker'
    
    // Add ID so we can identify it
    el.dataset.checkpointId = checkpoint.id
    
    // Create popup with checkpoint info
    const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
      <div class="checkpoint-popup">
        <h3>${checkpoint.name}</h3>
        <p>${checkpoint.description}</p>
        ${checkpoint.found 
          ? '<span class="found-tag">Found ✓</span>' 
          : ''}
      </div>
    `)
    
    // Create marker
    const marker = new mapboxgl.Marker({ element: el })
      .setLngLat([checkpoint.longitude, checkpoint.latitude])
      .setPopup(popup)
      .addTo(map!)
    
    // Store marker reference
    checkpointMarkers[checkpoint.id] = marker
  })
}

// Add danger zones to the map
function addDangerZones() {
  if (!map) return
  
  props.dangerZones.forEach((zone, index) => {
    const id = `zone-${zone.id}`
    
    // Add source for the zone
    map!.addSource(id, {
      type: 'geojson',
      data: {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [zone.longitude, zone.latitude]
        },
        properties: {}
      }
    })
    
    // Add circle layer
    map!.addLayer({
      id,
      type: 'circle',
      source: id,
      paint: {
        'circle-radius': {
          stops: [[10, 0], [15, zone.radiusMeters / 2], [20, zone.radiusMeters * 10]]
        },
        'circle-color': 'rgba(255, 0, 0, 0.3)',
        'circle-stroke-color': 'rgba(255, 0, 0, 0.8)',
        'circle-stroke-width': 2
      }
    })
  })
}

// Update player position when location changes
watch(() => location.position.value, (position) => {
  if (!position || !map || !playerMarker) return
  
  const { longitude, latitude } = position.coords
  
  // Update player marker position
  playerMarker.setLngLat([longitude, latitude])
  
  // Check for nearby checkpoints
  props.checkpoints.forEach(checkpoint => {
    if (checkpoint.found) return
    
    const distance = location.calculateDistance(
      latitude,
      longitude,
      checkpoint.latitude,
      checkpoint.longitude
    )
    
    // If player is within 20 meters, mark as discovered
    if (distance < 20) {
      emit('checkpoint-discovered', checkpoint.id)
      
      // Update marker style
      const markerEl = checkpointMarkers[checkpoint.id].getElement()
      markerEl.classList.add('checkpoint-found')
      
      // Update popup
      const popup = checkpointMarkers[checkpoint.id].getPopup()
      popup.setHTML(`
        <div class="checkpoint-popup">
          <h3>${checkpoint.name}</h3>
          <p>${checkpoint.description}</p>
          <span class="found-tag">Found ✓</span>
        </div>
      `)
    }
  })
  
  // Check for danger zones
  let foundDanger = false
  
  props.dangerZones.forEach(zone => {
    const distance = location.calculateDistance(
      latitude,
      longitude,
      zone.latitude,
      zone.longitude
    )
    
    if (distance < zone.radiusMeters) {
      foundDanger = true
      currentDangerZone.value = zone
    }
  })
  
  inDanger.value = foundDanger
}, { immediate: true })

// Clean up on unmount
onUnmounted(() => {
  location.stopWatching()
  
  if (map) {
    map.remove()
    map = null
  }
})
</script>

<style scoped>
.map-container {
  position: relative;
  width: 100%;
  height: 400px;
  border-radius: 8px;
  overflow: hidden;
}

#map {
  width: 100%;
  height: 100%;
}

.map-controls {
  position: absolute;
  bottom: 20px;
  right: 20px;
  z-index: 1;
}

.control-button {
  width: 40px;
  height: 40px;
  background-color: white;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  color: #333;
  border: none;
}

.control-button:hover {
  background-color: #f5f5f5;
}

.danger-alert {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(255, 0, 0, 0.8);
  color: white;
  padding: 8px 16px;
  border-radius: 4px;
  font-weight: bold;
  z-index: 1;
  animation: pulse 2s infinite;
}

.player-marker {
  width: 20px;
  height: 20px;
  background-color: #2563eb;
  border: 3px solid white;
  border-radius: 50%;
  box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.2);
}

.checkpoint-marker {
  width: 30px;
  height: 30px;
  background-color: #f97316;
  border: 3px solid white;
  border-radius: 50%;
  box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.2);
  cursor: pointer;
}

.checkpoint-found {
  background-color: #10b981;
}

@keyframes pulse {
  0% { opacity: 0.8; }
  50% { opacity: 1; }
  100% { opacity: 0.8; }
}

/* Global styles for MapboxGL popups */
:global(.checkpoint-popup) {
  padding: 5px;
}

:global(.checkpoint-popup h3) {
  margin: 0 0 5px 0;
  font-size: 16px;
  font-weight: bold;
}

:global(.checkpoint-popup p) {
  margin: 0 0 5px 0;
  font-size: 14px;
}

:global(.found-tag) {
  display: inline-block;
  background-color: #10b981;
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
}
</style>
```

## Step 4: Create the Main Quest Page

Now, let's create the main page for our quest application. Replace the content of `pages/index.vue` with:

```vue
<template>
  <div class="quest-container">
    <header class="quest-header">
      <h1>Zombie Run</h1>
      <div v-if="auth.isAuthenticated" class="player-info">
        <img 
          :src="auth.userData?.picture || '/player-default.png'" 
          alt="Player" 
          class="player-avatar"
        />
        <span>{{ auth.userData?.name || 'Survivor' }}</span>
      </div>
      <button 
        v-if="!auth.isAuthenticated" 
        @click="auth.login" 
        class="login-button"
      >
        Login to Play
      </button>
    </header>

    <main v-if="auth.isAuthenticated" class="quest-content">
      <div class="progress-bar">
        <div 
          class="progress-fill" 
          :style="{width: `${progressPercentage}%`}"
        ></div>
        <span class="progress-text">{{ foundCheckpoints }} / {{ totalCheckpoints }} checkpoints found</span>
      </div>
      
      <QuestMap 
        :checkpoints="questData.checkpoints" 
        :danger-zones="questData.dangerZones"
        @checkpoint-discovered="onCheckpointDiscovered"
      />
      
      <div class="quest-info">
        <div v-if="questData.isQuestComplete" class="quest-complete">
          <h2>Mission Complete! 🎉</h2>
          <p>You have successfully escaped the zombie apocalypse.</p>
          <button @click="restartQuest" class="restart-button">Restart Mission</button>
        </div>
        
        <div v-else-if="questData.nextCheckpoint" class="next-objective">
          <h2>Current Objective</h2>
          <div class="objective-card">
            <h3>{{ questData.nextCheckpoint.name }}</h3>
            <p>{{ questData.nextCheckpoint.description }}</p>
            <div v-if="distanceToNextCheckpoint" class="objective-distance">
              Distance: {{ formatDistance(distanceToNextCheckpoint) }}
            </div>
          </div>
        </div>
        
        <div class="checkpoints-list">
          <h2>Mission Checkpoints</h2>
          <div 
            v-for="checkpoint in questData.checkpoints" 
            :key="checkpoint.id"
            class="checkpoint-item"
            :class="{ 'checkpoint-found': checkpoint.found }"
          >
            <div class="checkpoint-status">
              <span v-if="checkpoint.found" class="status-icon">✓</span>
              <span v-else class="status-icon">○</span>
            </div>
            <div class="checkpoint-details">
              <h3>{{ checkpoint.name }}</h3>
              <p>{{ checkpoint.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </main>

    <div v-else class="auth-prompt">
      <h2>Zombie Apocalypse Alert!</h2>
      <p>The city has been overrun by zombies. Login to start your escape mission.</p>
      <button @click="auth.login" class="login-button">Login to Start</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useAuth, usePincastLocation, useAnalytics } from '@pincast/sdk';
import { useQuestData } from '~/composables/useQuestData';

// Initialize services
const auth = useAuth();
const location = usePincastLocation();
const analytics = useAnalytics();
const questData = useQuestData();

// Distance to next checkpoint
const distanceToNextCheckpoint = ref<number | null>(null);

// Calculate progress percentage
const totalCheckpoints = computed(() => questData.checkpoints.length);
const foundCheckpoints = computed(() => {
  return questData.checkpoints.filter(checkpoint => checkpoint.found).length;
});
const progressPercentage = computed(() => {
  return (foundCheckpoints.value / totalCheckpoints.value) * 100;
});

// Format distance for display
function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  } else {
    return `${(meters / 1000).toFixed(2)}km`;
  }
}

// Handle checkpoint discovery
function onCheckpointDiscovered(checkpointId: string) {
  // Find the checkpoint
  const checkpoint = questData.checkpoints.find(cp => cp.id === checkpointId);
  if (!checkpoint || checkpoint.found) return;
  
  // Mark as found
  checkpoint.found = true;
  
  // Save progress
  questData.saveProgress();
  
  // Track analytics event
  analytics.trackEvent('checkpoint_discovered', {
    checkpoint_id: checkpointId,
    checkpoint_name: checkpoint.name
  });
  
  // If quest is complete, track completion
  if (questData.isQuestComplete.value) {
    analytics.trackEvent('quest_completed', {
      time_taken: new Date().getTime() - (questStartTime || new Date().getTime())
    });
  }
}

// Restart the quest
function restartQuest() {
  // Reset all checkpoints
  questData.checkpoints.forEach(checkpoint => {
    checkpoint.found = false;
  });
  
  // Save progress
  questData.saveProgress();
  
  // Track analytics event
  analytics.trackEvent('quest_restarted');
  
  // Reset quest start time
  questStartTime = new Date().getTime();
}

// Track time when quest started
let questStartTime: number | null = null;

// Update distance to next checkpoint when location changes
watch(() => [location.position.value, questData.nextCheckpoint.value], () => {
  if (!location.position.value || !questData.nextCheckpoint.value) {
    distanceToNextCheckpoint.value = null;
    return;
  }
  
  const { latitude, longitude } = location.position.value.coords;
  const nextCheckpoint = questData.nextCheckpoint.value;
  
  distanceToNextCheckpoint.value = location.calculateDistance(
    latitude,
    longitude,
    nextCheckpoint.latitude,
    nextCheckpoint.longitude
  );
}, { immediate: true });

// Load saved progress when component mounts
onMounted(async () => {
  if (auth.isAuthenticated.value) {
    await questData.loadProgress();
    
    // Track quest start if not completed
    if (!questData.isQuestComplete.value) {
      questStartTime = new Date().getTime();
      analytics.trackEvent('quest_started');
    }
  }
});
</script>

<style scoped>
.quest-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.quest-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.quest-header h1 {
  font-size: 2rem;
  font-weight: bold;
  color: #2563eb;
  margin: 0;
}

.player-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.player-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.login-button {
  background-color: #2563eb;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
}

.login-button:hover {
  background-color: #1d4ed8;
}

.progress-bar {
  position: relative;
  height: 24px;
  background-color: #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 20px;
}

.progress-fill {
  height: 100%;
  background-color: #2563eb;
  transition: width 0.3s ease;
}

.progress-text {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.quest-info {
  margin-top: 20px;
}

.quest-complete {
  background-color: #10b981;
  color: white;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  margin-bottom: 20px;
}

.restart-button {
  background-color: white;
  color: #10b981;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  margin-top: 10px;
}

.next-objective {
  margin-bottom: 20px;
}

.objective-card {
  background-color: #f3f4f6;
  padding: 16px;
  border-radius: 8px;
  border-left: 4px solid #2563eb;
}

.objective-card h3 {
  margin-top: 0;
  margin-bottom: 8px;
  color: #2563eb;
}

.objective-card p {
  margin-bottom: 12px;
}

.objective-distance {
  font-weight: bold;
}

.checkpoints-list {
  margin-top: 30px;
}

.checkpoint-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 10px;
  background-color: #f3f4f6;
}

.checkpoint-found {
  background-color: #ecfdf5;
  border-left: 4px solid #10b981;
}

.checkpoint-status {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
}

.status-icon {
  font-size: 1.25rem;
  line-height: 1;
}

.checkpoint-found .status-icon {
  color: #10b981;
}

.checkpoint-details {
  flex: 1;
}

.checkpoint-details h3 {
  margin-top: 0;
  margin-bottom: 4px;
}

.checkpoint-details p {
  margin: 0;
  font-size: 0.9rem;
  color: #4b5563;
}

.auth-prompt {
  background-color: #f3f4f6;
  padding: 30px;
  border-radius: 8px;
  text-align: center;
  margin-top: 30px;
}

.auth-prompt h2 {
  color: #dc2626;
  margin-top: 0;
}

.auth-prompt .login-button {
  margin-top: 20px;
  font-size: 1rem;
  padding: 10px 20px;
}
</style>
```

## Step 5: Add Images for Checkpoints

Create a directory for checkpoint images:

```bash
mkdir -p public/checkpoints
```

Add images for your checkpoints in this directory. You can use stock photos or create custom illustrations.

## Step 6: Test the Application

Start the development server:

```bash
pincast dev
```

Open your browser to http://localhost:3000 and test your application:

1. Log in with your Pincast account
2. Allow location access
3. Navigate to the checkpoints (you can use Chrome DevTools to simulate different locations)
4. Test danger zone alerts
5. Complete the quest and test the restart function

## Step 7: Deploy the Application

When you're satisfied with your quest, deploy it to Pincast:

```bash
pincast deploy
```

Follow the instructions to complete the deployment. Once approved, your quest will be available to players in the Pincast Expo catalog!

## Extending the Quest

Here are some ideas to enhance your quest:

- Add a timer for time-based challenges
- Implement inventory management for collected items
- Add puzzles that must be solved at each checkpoint
- Create branching paths with different endings
- Add sound effects and background music
- Implement multiplayer features

## Conclusion

Congratulations! You've built a complete location-based quest application with Pincast Expo. This tutorial showed you how to:

1. Create and structure a quest application
2. Implement map functionality with Mapbox
3. Track player location and proximity to checkpoints
4. Save and load quest progress
5. Add gameplay elements like danger zones
6. Track analytics for player actions

You can use this foundation to create more complex and engaging location-based experiences.