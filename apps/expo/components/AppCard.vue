<template>
  <div class="bg-white rounded-md border border-primary shadow-primary overflow-hidden transition-all duration-300 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-card-hover">
    <div class="relative">
      <img 
        :src="app.heroUrl || '/images/default-app-hero.jpg'" 
        :alt="app.title" 
        class="w-full h-40 object-cover"
        @error="onImageError"
      />
      <div class="absolute top-2 right-2">
        <span 
          class="px-2 py-1 text-xs font-mono font-semibold rounded-md border" 
          :class="stateClasses"
        >
          {{ app.state }}
        </span>
      </div>
    </div>
    
    <div class="p-4 font-mono">
      <div class="flex justify-between items-start mb-2">
        <h3 class="text-lg font-semibold text-primary truncate">{{ app.title }}</h3>
        <div v-if="app.isPaid" class="text-xs font-semibold bg-primary-50 text-primary px-2 py-0.5 rounded-md border border-primary">
          ${{ (app.priceCents / 100).toFixed(2) }}
        </div>
      </div>
      
      <div class="text-sm mb-3">
        <div class="flex items-center mb-1">
          <icon name="uil:user" class="mr-1 w-4 h-4 text-primary" />
          <span>{{ app.owner?.email || 'Unknown developer' }}</span>
        </div>
        <div class="flex items-center mb-1">
          <icon name="uil:calendar-alt" class="mr-1 w-4 h-4 text-primary" />
          <span>{{ formatDate(app.createdAt) }}</span>
        </div>
        <div v-if="app.latestVersion?.lighthouseScore" class="flex items-center">
          <icon name="uil:tachometer-fast" class="mr-1 w-4 h-4 text-primary" />
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
      return 'border-tertiary text-tertiary'
    case 'published':
      return 'border-primary text-primary'
    case 'rejected':
      return 'border-secondary text-secondary'
    case 'hidden':
      return 'border-gray-500 text-gray-500'
    default:
      return 'border-gray-500 text-gray-500'
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