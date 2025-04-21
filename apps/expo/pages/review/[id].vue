<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Loading state -->
    <div v-if="loading" class="flex justify-center my-12">
      <div class="loader">Loading...</div>
    </div>
    
    <!-- Error message -->
    <div v-else-if="error" class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 my-4">
      <p>{{ error }}</p>
      <div class="mt-2">
        <button @click="fetchData" class="text-sm underline mr-4">Try again</button>
        <nuxt-link to="/review" class="text-sm underline">Back to review list</nuxt-link>
      </div>
    </div>
    
    <template v-else-if="app">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <nuxt-link to="/review" class="text-blue-600 hover:underline mb-2 inline-flex items-center">
            <icon name="uil:arrow-left" class="w-5 h-5 mr-1" />
            Back to review list
          </nuxt-link>
          <h1 class="text-3xl font-bold">{{ app.title }}</h1>
        </div>
        
        <div class="flex space-x-2">
          <span 
            class="px-3 py-1 text-sm font-semibold rounded-full" 
            :class="stateClasses"
          >
            {{ app.state }}
          </span>
        </div>
      </div>
      
      <!-- Main content area -->
      <div class="flex flex-col lg:flex-row gap-6">
        <!-- Sidebar -->
        <div class="w-full lg:w-1/3">
          <div class="bg-white rounded-lg shadow overflow-hidden mb-6">
            <!-- App image -->
            <img 
              :src="app.heroUrl || '/images/default-app-hero.jpg'" 
              :alt="app.title" 
              class="w-full h-48 object-cover"
              @error="onImageError"
            />
            
            <!-- App metadata -->
            <div class="p-4">
              <div class="mb-4">
                <h3 class="text-lg font-semibold text-gray-800 mb-2">App Information</h3>
                
                <div class="grid grid-cols-1 gap-2">
                  <div>
                    <span class="text-sm text-gray-500">Developer:</span>
                    <p>{{ app.owner?.email || 'Unknown' }}</p>
                  </div>
                  
                  <div>
                    <span class="text-sm text-gray-500">Slug:</span>
                    <p>{{ app.slug }}</p>
                  </div>
                  
                  <div>
                    <span class="text-sm text-gray-500">Submitted:</span>
                    <p>{{ formatDate(app.createdAt) }}</p>
                  </div>
                  
                  <div v-if="app.isPaid">
                    <span class="text-sm text-gray-500">Price:</span>
                    <p>${{ (app.priceCents / 100).toFixed(2) }}</p>
                  </div>
                  
                  <div v-if="app.category">
                    <span class="text-sm text-gray-500">Category:</span>
                    <p>{{ app.category }}</p>
                  </div>
                  
                  <div>
                    <span class="text-sm text-gray-500">Geolocation:</span>
                    <p v-if="geoCoordinates">
                      {{ geoCoordinates[1].toFixed(6) }}, {{ geoCoordinates[0].toFixed(6) }} 
                      (radius: {{ app.geoRadius || '1000' }}m)
                    </p>
                    <p v-else>Location data not available</p>
                  </div>
                </div>
              </div>
              
              <!-- Action buttons -->
              <div class="space-y-2">
                <button 
                  v-if="['pending', 'hidden'].includes(app.state)"
                  @click="handleApprove"
                  class="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition duration-150 ease-in-out"
                  :disabled="isActionLoading"
                >
                  {{ app.state === 'pending' ? 'Approve' : 'Republish' }}
                </button>
                
                <button 
                  v-if="app.state === 'pending'"
                  @click="handleReject"
                  class="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition duration-150 ease-in-out"
                  :disabled="isActionLoading"
                >
                  Reject
                </button>
                
                <button 
                  v-if="app.state === 'published'"
                  @click="handleHide"
                  class="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition duration-150 ease-in-out"
                  :disabled="isActionLoading"
                >
                  Hide
                </button>
              </div>
            </div>
          </div>
          
          <!-- Version history -->
          <div class="bg-white rounded-lg shadow overflow-hidden">
            <div class="p-4 bg-gray-50 border-b">
              <h3 class="font-semibold">Version History</h3>
            </div>
            
            <div class="p-4">
              <div v-if="!app.versions || app.versions.length === 0" class="text-gray-500 text-center py-4">
                No version history available
              </div>
              
              <div v-else class="space-y-4">
                <div 
                  v-for="(version, index) in app.versions" 
                  :key="version.id"
                  class="border-b last:border-b-0 pb-3 last:pb-0"
                >
                  <div class="flex justify-between items-start">
                    <div>
                      <div class="font-medium">v{{ version.semver }}</div>
                      <div class="text-sm text-gray-500">{{ formatDate(version.createdAt) }}</div>
                      
                      <div v-if="version.lighthouseScore" class="mt-1 text-sm">
                        Lighthouse: {{ version.lighthouseScore }}/100
                      </div>
                      
                      <div v-if="version.changelog" class="mt-1 text-sm text-gray-600">
                        {{ version.changelog }}
                      </div>
                      
                      <div class="mt-2">
                        <a 
                          :href="version.deployUrl" 
                          target="_blank" 
                          class="text-blue-600 hover:underline text-sm inline-flex items-center"
                        >
                          <icon name="uil:external-link-alt" class="w-4 h-4 mr-1" />
                          View build
                        </a>
                      </div>
                    </div>
                    
                    <button 
                      v-if="index > 0"
                      @click="handleRollback(version.id)"
                      class="text-sm bg-gray-100 hover:bg-gray-200 text-gray-800 px-2 py-1 rounded"
                      :disabled="isActionLoading"
                    >
                      Rollback
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Preview area -->
        <div class="w-full lg:w-2/3 bg-white rounded-lg shadow overflow-hidden">
          <div class="p-4 bg-gray-50 border-b flex justify-between items-center">
            <h2 class="font-semibold">App Preview</h2>
            
            <a 
              :href="currentVersion?.deployUrl || '#'" 
              target="_blank" 
              class="text-blue-600 hover:underline text-sm"
            >
              Open in new tab
            </a>
          </div>
          
          <div class="relative" style="height: 720px;">
            <iframe 
              v-if="currentVersion?.deployUrl"
              :src="currentVersion.deployUrl" 
              class="w-full h-full border-0"
              sandbox="allow-scripts allow-same-origin allow-forms"
              referrerpolicy="no-referrer"
            ></iframe>
            
            <div v-else class="w-full h-full flex items-center justify-center bg-gray-100">
              <div class="text-center text-gray-500">
                <icon name="uil:eye-slash" class="w-12 h-12 mx-auto mb-2" />
                <p>No preview URL available</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from '#imports'
import { useReview } from '~/composables/useReview'
import { useToast } from '~/composables/useToast'
import type { AppState, Version } from '~/server/db/schema'

// Set page meta
definePageMeta({
  requiresRole: 'staff'
})

// Get the review composable and route
const { 
  fetchAppDetails,
  approveApp,
  rejectApp,
  hideApp,
  rollbackVersion
} = useReview()
const route = useRoute()
const toast = useToast()

// Local state
const app = ref<any>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const isActionLoading = ref(false)
const geoCoordinates = ref<[number, number] | null>(null)

// Get the current version
const currentVersion = computed<Version | undefined>(() => {
  if (!app.value?.versions?.length) return undefined
  return app.value.versions[0]
})

// Compute state-specific classes for the badge
const stateClasses = computed(() => {
  if (!app.value) return ''
  
  switch (app.value.state as AppState) {
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

// Fetch app data
async function fetchData() {
  loading.value = true
  error.value = null
  
  try {
    const appId = route.params.id as string
    app.value = await fetchAppDetails(appId)
    
    // Extract geo coordinates if available
    if (app.value?.geoArea) {
      const match = app.value.geoArea.match(/POINT\(([^ ]+) ([^)]+)\)/)
      if (match) {
        geoCoordinates.value = [parseFloat(match[1]), parseFloat(match[2])]
      }
    }
  } catch (err: any) {
    error.value = err.message || 'Failed to load app details'
    console.error('Error fetching app details:', err)
  } finally {
    loading.value = false
  }
}

// Handle approve action
async function handleApprove() {
  if (!app.value) return
  
  isActionLoading.value = true
  try {
    await approveApp(app.value.id)
    toast.success('App approved and published successfully')
    await fetchData() // Refresh data
  } catch (err: any) {
    toast.error(err.message || 'Failed to approve app')
  } finally {
    isActionLoading.value = false
  }
}

// Handle reject action
async function handleReject() {
  if (!app.value) return
  
  isActionLoading.value = true
  try {
    await rejectApp(app.value.id)
    toast.success('App rejected successfully')
    await fetchData() // Refresh data
  } catch (err: any) {
    toast.error(err.message || 'Failed to reject app')
  } finally {
    isActionLoading.value = false
  }
}

// Handle hide action
async function handleHide() {
  if (!app.value) return
  
  isActionLoading.value = true
  try {
    await hideApp(app.value.id)
    toast.success('App hidden successfully')
    await fetchData() // Refresh data
  } catch (err: any) {
    toast.error(err.message || 'Failed to hide app')
  } finally {
    isActionLoading.value = false
  }
}

// Handle rollback action
async function handleRollback(versionId: string) {
  if (!app.value) return
  
  isActionLoading.value = true
  try {
    await rollbackVersion(app.value.id, versionId)
    toast.success('App version rolled back successfully')
    await fetchData() // Refresh data
  } catch (err: any) {
    toast.error(err.message || 'Failed to rollback version')
  } finally {
    isActionLoading.value = false
  }
}

// Helper function to format dates
function formatDate(date: Date | string | undefined): string {
  if (!date) return 'Unknown'
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Handle image load errors
function onImageError(event: Event) {
  const target = event.target as HTMLImageElement
  target.src = '/images/default-app-hero.jpg'
}

// Fetch data on mount
onMounted(fetchData)
</script>

<style scoped>
.loader {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 2s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>