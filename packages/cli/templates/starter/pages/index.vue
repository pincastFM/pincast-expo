<template>
  <div class="home-container">
    <div v-if="auth.isAuthenticated">
      <div class="map-container">
        <div id="map" ref="mapElement"></div>
      </div>
      
      <div class="quest-container">
        <h2>Demo Quest</h2>
        <p>Find all 3 checkpoints to complete the quest!</p>
        
        <div class="checkpoints">
          <div v-for="(checkpoint, index) in checkpoints" :key="index" class="checkpoint" :class="{ 'checkpoint-found': checkpoint.found }">
            <span class="checkpoint-number">{{ index + 1 }}</span>
            <div class="checkpoint-details">
              <h3>{{ checkpoint.name }}</h3>
              <p>{{ checkpoint.description }}</p>
              <span v-if="checkpoint.found" class="found-text">Found!</span>
              <span v-else class="distance-text">{{ formatDistance(checkpoint.distance) }} away</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div v-else class="auth-prompt">
      <h2>Adventure Awaits!</h2>
      <p>Login to start your location-based adventure.</p>
      <button @click="auth.login" class="login-button">Login to Play</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watchEffect } from 'vue';
import { useAuth, usePincastLocation } from '@pincast/sdk';
import mapboxgl from 'mapbox-gl';

// Get runtime config
const config = useRuntimeConfig();

// Initialize auth and location services
const auth = useAuth();
const location = usePincastLocation();

// Reference to the map element
const mapElement = ref<HTMLElement | null>(null);
let map: mapboxgl.Map | null = null;
let playerMarker: mapboxgl.Marker | null = null;
let checkpointMarkers: mapboxgl.Marker[] = [];

// Demo quest checkpoints
const checkpoints = ref([
  {
    name: 'Starting Point',
    description: 'The beginning of your journey',
    lat: 37.7749,
    lng: -122.4194,
    found: false,
    distance: 0
  },
  {
    name: 'Hidden Treasure',
    description: 'Find the secret cache',
    lat: 37.7749 + 0.002,
    lng: -122.4194 + 0.001,
    found: false,
    distance: 0
  },
  {
    name: 'Final Destination',
    description: 'Complete your quest here',
    lat: 37.7749 - 0.001,
    lng: -122.4194 + 0.002,
    found: false,
    distance: 0
  }
]);

// Helper function to calculate distance between two coordinates
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

// Format distance for display
function formatDistance(distance: number) {
  if (distance < 1000) {
    return `${Math.round(distance)}m`;
  } else {
    return `${(distance / 1000).toFixed(1)}km`;
  }
}

// Initialize map when component is mounted
onMounted(() => {
  // Set Mapbox access token
  mapboxgl.accessToken = config.public.mapboxAccessToken;
  
  if (mapElement.value) {
    // Create map
    map = new mapboxgl.Map({
      container: mapElement.value,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [-122.4194, 37.7749], // Default to San Francisco
      zoom: 14
    });
    
    // Add navigation control
    map.addControl(new mapboxgl.NavigationControl(), 'top-right');
    
    // Add player marker
    playerMarker = new mapboxgl.Marker({ color: '#2563eb' })
      .setLngLat([-122.4194, 37.7749])
      .addTo(map);
      
    // Add checkpoint markers
    checkpoints.value.forEach((checkpoint, index) => {
      const el = document.createElement('div');
      el.className = 'checkpoint-marker';
      el.textContent = (index + 1).toString();
      
      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([checkpoint.lng, checkpoint.lat])
        .addTo(map!);
        
      checkpointMarkers.push(marker);
    });
  }
  
  // Start watching player location
  location.startWatching();
});

// Update player position and checkpoint distances when location changes
watchEffect(() => {
  if (!location.position.value || !map || !playerMarker) return;
  
  const { latitude, longitude } = location.position.value.coords;
  
  // Update player marker position
  playerMarker.setLngLat([longitude, latitude]);
  
  // Center map on player
  map.setCenter([longitude, latitude]);
  
  // Update checkpoint distances and check if found
  checkpoints.value.forEach(checkpoint => {
    checkpoint.distance = calculateDistance(
      latitude,
      longitude,
      checkpoint.lat,
      checkpoint.lng
    );
    
    // Mark checkpoint as found if within 20 meters
    if (checkpoint.distance < 20) {
      checkpoint.found = true;
    }
  });
});
</script>

<style>
.home-container {
  max-width: 1200px;
  margin: 0 auto;
}

.auth-prompt {
  text-align: center;
  padding: 2rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.auth-prompt .login-button {
  background-color: #2563eb;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  margin-top: 1rem;
}

.map-container {
  height: 400px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

#map {
  width: 100%;
  height: 100%;
}

.quest-container {
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.checkpoints {
  margin-top: 1.5rem;
}

.checkpoint {
  display: flex;
  align-items: flex-start;
  padding: 1rem;
  border-radius: 8px;
  background-color: #f3f4f6;
  margin-bottom: 1rem;
}

.checkpoint-found {
  background-color: #ecfdf5;
  border-left: 4px solid #10b981;
}

.checkpoint-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  background-color: #d1d5db;
  color: #1f2937;
  border-radius: 50%;
  font-weight: bold;
  margin-right: 1rem;
}

.checkpoint-found .checkpoint-number {
  background-color: #10b981;
  color: white;
}

.checkpoint-details {
  flex: 1;
}

.checkpoint-details h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
}

.checkpoint-details p {
  margin: 0 0 0.5rem 0;
  color: #6b7280;
  font-size: 0.9rem;
}

.found-text {
  display: inline-block;
  color: #10b981;
  font-weight: bold;
  font-size: 0.9rem;
}

.distance-text {
  display: inline-block;
  color: #6b7280;
  font-size: 0.9rem;
}

.checkpoint-marker {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  background-color: #ef4444;
  color: white;
  border-radius: 50%;
  font-weight: bold;
  border: 2px solid white;
}
</style>