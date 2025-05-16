<template>
  <div class="catalog-filters p-4 bg-white border border-primary shadow-primary rounded-md mb-6 font-mono">
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <!-- Sort Options -->
      <div class="flex items-center gap-2">
        <span class="text-primary font-semibold">Sort by:</span>
        <div class="flex gap-2">
          <button 
            v-for="option in sortOptions" 
            :key="option.value"
            @click="selectedSort = option.value"
            :class="[
              'px-3 py-1 rounded-md text-sm font-semibold border transition-all',
              selectedSort === option.value 
                ? 'bg-primary text-white border-primary' 
                : 'bg-white text-primary border-primary hover:bg-primary-50'
            ]"
          >
            {{ option.label }}
          </button>
        </div>
      </div>
      
      <!-- Location Controls -->
      <div class="flex items-center gap-3">
        <button 
          v-if="selectedSort === 'distance'"
          @click="$emit('locate')"
          class="flex items-center gap-1 px-3 py-1 bg-white border border-primary text-primary hover:bg-primary-50 rounded-md text-sm font-semibold transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {{ hasLocation ? 'Update location' : 'Use my location' }}
        </button>
        
        <div class="flex items-center gap-2" v-if="selectedSort === 'distance' && hasLocation">
          <label for="radius" class="text-sm text-primary font-semibold">Radius:</label>
          <select 
            id="radius" 
            v-model="radius"
            class="py-1 px-2 border border-primary rounded-md text-sm bg-white text-primary font-mono focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option v-for="r in radiusOptions" :key="r.value" :value="r.value">{{ r.label }}</option>
          </select>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Using defineModel pattern rather than #imports alias
const selectedSort = defineModel<string>('sort', { default: 'popularity' });
// Type assertion to ensure we're only assigning valid values
const radius = defineModel<number>('radius', { default: 50000 });
const hasLocation = defineModel<boolean>('hasLocation', { default: false });

// Options for sort dropdown
const sortOptions = [
  { label: 'Nearest', value: 'distance' },
  { label: 'Most Popular', value: 'popularity' },
  { label: 'Newest', value: 'newest' }
];

// Options for radius dropdown
const radiusOptions = [
  { label: '1km', value: 1000 },
  { label: '5km', value: 5000 },
  { label: '10km', value: 10000 },
  { label: '25km', value: 25000 },
  { label: '50km', value: 50000 },
  { label: '100km', value: 100000 },
  { label: '200km', value: 200000 }
];

// Emitted events
defineEmits(['locate']);
</script>