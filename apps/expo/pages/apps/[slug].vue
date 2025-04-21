<template>
  <div class="min-h-screen bg-gray-100 p-6">
    <div class="max-w-4xl mx-auto">
      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center py-16">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-primary-500"></div>
      </div>
      
      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 p-4 rounded-lg shadow">
        <h2 class="text-lg font-medium text-red-700 mb-2">Error</h2>
        <p class="text-red-600">{{ error }}</p>
        <div class="mt-4">
          <NuxtLink to="/browse" class="text-primary-500 hover:text-primary-700">
            ← Return to Browse
          </NuxtLink>
        </div>
      </div>
      
      <!-- App Details -->
      <div v-else-if="app" class="bg-white rounded-lg shadow overflow-hidden">
        <!-- Header -->
        <div class="flex justify-between items-center p-4 border-b">
          <NuxtLink to="/browse" class="text-primary-500 hover:text-primary-700 text-sm flex items-center">
            <span class="mr-1">←</span> Back to Browse
          </NuxtLink>
          
          <span class="text-sm text-gray-500">Version {{ app.semver }}</span>
        </div>
        
        <!-- Hero Image -->
        <div class="relative">
          <img 
            v-if="app.heroUrl" 
            :src="app.heroUrl" 
            :alt="app.title" 
            class="w-full h-64 object-cover"
          />
          <div v-else class="w-full h-64 bg-gradient-to-r from-primary-500 to-purple-500 flex items-center justify-center">
            <h1 class="text-white text-3xl font-bold">{{ app.title }}</h1>
          </div>
        </div>
        
        <!-- Main Content -->
        <div class="p-6">
          <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ app.title }}</h1>
          <p class="text-gray-600 mb-6">
            By {{ app.ownerName }}
          </p>
          
          <!-- Map Preview -->
          <div class="mb-6">
            <h2 class="text-lg font-semibold text-gray-800 mb-2">Location</h2>
            <div class="aspect-video bg-gray-200 rounded-lg overflow-hidden">
              <img 
                :src="getMapImageUrl(app.geo.center[0], app.geo.center[1])" 
                alt="Location map" 
                class="w-full h-full object-cover"
              />
            </div>
            <p class="mt-2 text-sm text-gray-600">
              This experience is centered at coordinates ({{ app.geo.center[1].toFixed(5) }}, {{ app.geo.center[0].toFixed(5) }})
              with a radius of {{ (app.geo.radiusMeters / 1000).toFixed(1) }} km.
            </p>
          </div>
          
          <!-- Play Section -->
          <div class="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="font-medium text-gray-900">Ready to start your experience?</h3>
                <p class="text-gray-600 text-sm mt-1">
                  Launch this app to explore this location-based experience
                </p>
              </div>
              
              <button 
                @click="handlePlay" 
                class="px-6 py-2 bg-primary-600 text-white rounded-lg shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                :disabled="playLoading"
              >
                <span v-if="playLoading">
                  <span class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                  Loading...
                </span>
                <span v-else>Play</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- App Player Modal -->
    <Teleport to="body">
      <div v-if="isPlaying" class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
        <div class="relative w-full max-w-6xl h-[90vh] bg-white rounded-lg shadow-xl overflow-hidden">
          <!-- Modal Header -->
          <div class="absolute top-0 left-0 right-0 bg-gradient-to-b from-black to-transparent p-4 z-10">
            <div class="flex justify-between items-center">
              <h3 class="text-white font-medium">{{ app?.title }}</h3>
              <button 
                @click="closeExperience" 
                class="text-white hover:text-red-300"
                data-cy="close-experience"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          
          <!-- App IFrame -->
          <iframe 
            v-if="playerUrl" 
            :src="playerUrl" 
            class="w-full h-full border-0"
            allow="geolocation; camera; microphone; fullscreen"
          ></iframe>
          
          <!-- Loading State -->
          <div v-else class="w-full h-full flex items-center justify-center">
            <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-primary-500"></div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useCatalog } from '~/composables/useCatalog';
import { usePlayerToken } from '~/composables/usePlayerToken';
// import { useUserStore } from '~/composables/useUserStore'; // Not needed
import { useToast } from '~/composables/useToast';

// Get the slug parameter
const route = useRoute();
const slug = computed(() => route.params.slug as string);

// Initialize composables
const { loadAppBySlug, loading, error, currentApp: app } = useCatalog();
const { getPlayerToken, loading: playLoading } = usePlayerToken();
// const userStore = useUserStore(); // Not needed for this component
const toast = useToast();

// Play state
const isPlaying = ref(false);
const playerUrl = ref<string | null>(null);

// Load the app details on mount
onMounted(async () => {
  try {
    await loadAppBySlug(slug.value);
  } catch (err) {
    console.error('Error loading app:', err);
  }
});

// Handle play button click
const handlePlay = async () => {
  if (!app.value) return;
  
  try {
    // Get player token for this app
    const token = await getPlayerToken(app.value.id);
    
    if (!token) {
      toast.error('Failed to authenticate. Please try again.');
      return;
    }
    
    // Construct player URL with token
    if (app.value.buildUrl) {
      playerUrl.value = `${app.value.buildUrl}?token=${token}`;
      isPlaying.value = true;
    } else {
      toast.error('This app is not available for play at the moment.');
    }
  } catch (err) {
    console.error('Error starting experience:', err);
    toast.error('Failed to start experience. Please try again.');
  }
};

// Close the experience
const closeExperience = () => {
  isPlaying.value = false;
  playerUrl.value = null;
};

// Get static map image URL
const getMapImageUrl = (longitude: number, latitude: number) => {
  if (!app.value) return '';
  
  // For TypeScript, we'll need to use center coordinates instead
  longitude = app.value.geo.center[0];
  latitude = app.value.geo.center[1];
  const mapboxToken = 'pk.eyJ1IjoicGluY2FzdCIsImEiOiJjbDg1N2FmNGQwMDJrM3BueTFmeHZvbGtiIn0.1xKRtKPIoN5XkNgZjejHCw';
  const zoom = 14;
  const width = 800;
  const height = 400;
  
  return `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/pin-l+F00(${longitude},${latitude})/${longitude},${latitude},${zoom},0/${width}x${height}@2x?access_token=${mapboxToken}`;
};
</script>