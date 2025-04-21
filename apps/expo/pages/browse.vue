<template>
  <div class="catalog-page min-h-screen bg-gray-100 p-6">
    <div class="max-w-6xl mx-auto">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold text-gray-900">Browse Experiences</h1>
        <NuxtLink to="/" class="text-primary-500 hover:text-primary-700">
          Back to Home
        </NuxtLink>
      </div>
      
      <!-- Filters -->
      <CatalogFilters 
        v-model:sort="sortOption" 
        v-model:radius="radiusValue" 
        v-model:hasLocation="hasLocation"
        @locate="handleLocate"
        class="mb-6"
      />
      
      <!-- Loading State -->
      <div v-if="catalog.loading" class="flex justify-center items-center py-12 bg-white rounded-lg shadow">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
      
      <!-- Error State -->
      <div v-else-if="catalog.error" class="bg-red-50 p-4 rounded-lg text-center shadow">
        <p class="text-red-700">{{ catalog.error }}</p>
        <button @click="refreshCatalog" class="mt-3 px-4 py-2 bg-red-600 text-white rounded-md">
          Try Again
        </button>
      </div>
      
      <!-- Authentication Prompt (shown when not logged in) -->
      <div v-else-if="!isAuthenticated" class="bg-blue-50 p-6 rounded-lg text-center shadow mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-blue-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <h3 class="text-lg font-medium text-gray-900 mb-2">Sign in to Play Experiences</h3>
        <p class="text-gray-600 mb-4">
          You can browse experiences without an account, but signing in is required to play them.
        </p>
        <button @click="() => signIn()" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          Sign In
        </button>
      </div>
      
      <!-- No Results -->
      <div v-else-if="items.length === 0" class="text-center py-16 bg-white rounded-lg shadow">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
        <h3 class="text-lg font-medium text-gray-900 mb-1">No Experiences Found</h3>
        <p class="text-gray-600 mb-4">
          {{ 
            sortOption === 'distance' 
              ? 'Try increasing the search radius or check out popular experiences instead.' 
              : 'Try changing your search criteria or check back later.'
          }}
        </p>
        <button
          v-if="sortOption === 'distance'"
          @click="radiusValue = Math.min(radiusValue * 2, 200000)"
          class="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600"
        >
          Increase Search Radius
        </button>
      </div>
      
      <!-- Results Grid -->
      <div 
        v-else 
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <div
          v-for="app in items" 
          :key="app.id"
          class="catalog-item bg-white rounded-lg overflow-hidden shadow hover:shadow-md transition-shadow"
        >
          <NuxtLink :to="`/apps/${app.slug}`" class="block">
            <!-- Hero Image -->
            <div v-if="app.heroUrl" class="aspect-video bg-gray-100 relative">
              <img 
                :src="app.heroUrl" 
                :alt="app.title" 
                class="w-full h-full object-cover"
              />
            </div>
            <div v-else class="aspect-video bg-gradient-to-r from-primary-500 to-purple-500 flex items-center justify-center">
              <span class="text-white text-lg font-semibold">{{ app.title }}</span>
            </div>
            
            <!-- App Info -->
            <div class="p-4">
              <h3 class="font-semibold text-gray-900 text-lg">{{ app.title }}</h3>
              
              <!-- Distance Badge (if applicable) -->
              <div v-if="app.distanceMeters !== undefined" class="mt-2 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                <span class="text-sm text-gray-600">
                  {{ catalog.formatDistance(app.distanceMeters) }} away
                </span>
              </div>
              
              <!-- Popularity Badge -->
              <div class="mt-2">
                <span 
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  :class="app.sessions7d > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1 -ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  {{ app.sessions7d }} {{ app.sessions7d === 1 ? 'play' : 'plays' }} this week
                </span>
              </div>
            </div>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import { useCatalog, type SortOption } from '~/composables/useCatalog';
// In a real app, we would import from the SDK
// but for testing, we'll use a simple mock
const isAuthenticated = ref(false);
const signIn = () => {
  console.log('Sign in clicked');
};

// Initialize catalog composable
const catalog = useCatalog();

// Reactive data
const items = computed(() => catalog.items.value);
const sortOption = ref<SortOption>('popularity');
const radiusValue = ref(50000);
const hasLocation = ref(false);

// Load catalog on mount
onMounted(async () => {
  try {
    // Try to get user's location in the background
    // We don't need to call refreshCatalog() here since the watch will handle it
    await catalog.getUserLocation();
    hasLocation.value = true;
  } catch (err) {
    console.error('Could not get location:', err);
    // No need to change sort since popularity is the default
  }
});

// When filters change, refresh the catalog
watch([sortOption, radiusValue], () => {
  refreshCatalog();
}, { immediate: true });

// Handle locate button click
const handleLocate = async () => {
  try {
    await catalog.getUserLocation();
    hasLocation.value = true;
    refreshCatalog();
  } catch (err) {
    console.error('Could not get location:', err);
    // Show error message
    catalog.error.value = 'Location access denied. Please enable location services or try another sort option.';
  }
};

// Refresh catalog based on current filters
const refreshCatalog = () => {
  const options: { sort: SortOption; radius: number; lat?: number; lng?: number } = {
    sort: sortOption.value,
    radius: radiusValue.value,
  };
  
  // Add location if available and needed
  if (sortOption.value === 'distance' && catalog.userLocation.value) {
    options.lat = catalog.userLocation.value.lat;
    options.lng = catalog.userLocation.value.lng;
  }
  
  // Load catalog with options
  catalog.load(options);
};
</script>