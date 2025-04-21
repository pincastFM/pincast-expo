<template>
  <div class="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-300">
    <div class="relative">
      <img 
        :src="app.heroUrl || '/images/default-app-hero.jpg'" 
        :alt="app.title" 
        class="w-full h-40 object-cover"
        @error="onImageError"
      />
      <div class="absolute top-2 right-2">
        <span 
          class="px-2 py-1 text-xs font-semibold rounded-full" 
          :class="stateClasses"
        >
          {{ app.state }}
        </span>
      </div>
    </div>
    
    <div class="p-4">
      <div class="flex justify-between items-start mb-2">
        <h3 class="text-lg font-semibold text-gray-800 truncate">{{ app.title }}</h3>
        <div v-if="app.isPaid" class="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
          ${{ (app.priceCents / 100).toFixed(2) }}
        </div>
      </div>
      
      <div class="text-sm text-gray-500 mb-3">
        <div class="flex items-center mb-1">
          <icon name="uil:user" class="mr-1 w-4 h-4" />
          <span>{{ app.owner?.email || 'Unknown developer' }}</span>
        </div>
        <div class="flex items-center mb-1">
          <icon name="uil:calendar-alt" class="mr-1 w-4 h-4" />
          <span>{{ formatDate(app.createdAt) }}</span>
        </div>
        <div v-if="app.latestVersion?.lighthouseScore" class="flex items-center">
          <icon name="uil:tachometer-fast" class="mr-1 w-4 h-4" />
          <span>Score: {{ app.latestVersion.lighthouseScore }}</span>
        </div>
      </div>
      
      <div class="flex flex-wrap gap-2 mt-auto">
        <slot name="actions"></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { AppState } from '~/server/db/schema'

// Import the AppWithOwner type from useReview
import type { AppWithOwner } from '~/composables/useReview'

// Define props
interface AppCardProps {
  app: AppWithOwner;
}

const props = defineProps<AppCardProps>()

// Compute state-specific classes for the badge
const stateClasses = computed(() => {
  switch (props.app.state as AppState) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'published':
      return 'bg-green-100 text-green-800'
    case 'rejected':
      return 'bg-red-100 text-red-800'
    case 'hidden':
      return 'bg-gray-100 text-gray-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
})

// Helper function to format dates
function formatDate(date: Date | string | undefined): string {
  if (!date) return 'Unknown'
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Handle image load errors
function onImageError(event: Event) {
  const target = event.target as HTMLImageElement
  target.src = '/images/default-app-hero.jpg'
}
</script>