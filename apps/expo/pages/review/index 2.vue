<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-8">App Review Dashboard</h1>
    
    <!-- Tabs -->
    <div class="border-b border-gray-200 mb-6">
      <nav class="flex -mb-px">
        <button 
          @click="activeTab = 'pending'"
          class="py-2 px-4 text-center border-b-2 font-medium text-lg"
          :class="activeTab === 'pending' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
        >
          Pending ({{ pending.length }})
        </button>
        <button 
          @click="activeTab = 'hidden'"
          class="py-2 px-4 text-center border-b-2 font-medium text-lg"
          :class="activeTab === 'hidden' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
        >
          Hidden ({{ hidden.length }})
        </button>
      </nav>
    </div>
    
    <!-- Loading state -->
    <div v-if="loading" class="flex justify-center my-12">
      <div class="loader">Loading...</div>
    </div>
    
    <!-- Error message -->
    <div v-else-if="error" class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 my-4">
      <p>{{ error }}</p>
      <button @click="fetchReviewList" class="mt-2 text-sm underline">Try again</button>
    </div>
    
    <!-- Empty state -->
    <div v-else-if="(activeTab === 'pending' && pending.length === 0) || (activeTab === 'hidden' && hidden.length === 0)" class="text-center my-12">
      <div class="text-gray-500">
        <icon name="uil:box" class="w-16 h-16 mx-auto mb-4" />
        <p class="text-xl">No apps to review in this category</p>
      </div>
    </div>
    
    <!-- App list -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <app-card 
        v-for="app in activeTabApps" 
        :key="app.id" 
        :app="app"
      >
        <template #actions>
          <nuxt-link 
            :to="`/review/${app.id}`" 
            class="bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-1 rounded-md text-sm font-medium"
          >
            Details
          </nuxt-link>
          
          <template v-if="app.state === 'pending'">
            <button
              @click="handleApprove(app.id)"
              class="bg-green-100 hover:bg-green-200 text-green-800 px-3 py-1 rounded-md text-sm font-medium"
              :disabled="isActionLoading"
            >
              Approve
            </button>
            <button
              @click="handleReject(app.id)"
              class="bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded-md text-sm font-medium"
              :disabled="isActionLoading"
            >
              Reject
            </button>
          </template>
          
          <template v-if="app.state === 'published'">
            <button
              @click="handleHide(app.id)"
              class="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded-md text-sm font-medium"
              :disabled="isActionLoading"
            >
              Hide
            </button>
          </template>
          
          <template v-if="app.state === 'hidden'">
            <button
              @click="handleApprove(app.id)"
              class="bg-green-100 hover:bg-green-200 text-green-800 px-3 py-1 rounded-md text-sm font-medium"
              :disabled="isActionLoading"
            >
              Republish
            </button>
          </template>
        </template>
      </app-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useReview } from '~/composables/useReview'
import { useToast } from '~/composables/useToast'

// Set page meta
definePageMeta({
  requiresRole: 'staff'
})

// Get the review composable
const { 
  pending, 
  hidden, 
  loading, 
  error, 
  fetchReviewList,
  approveApp,
  rejectApp,
  hideApp
} = useReview()

// Create toast notifications
const toast = useToast()

// Track which tab is active
const activeTab = ref<'pending' | 'hidden'>('pending')

// Track if actions are in progress
const isActionLoading = ref(false)

// Get the apps for the active tab
const activeTabApps = computed(() => {
  return activeTab.value === 'pending' ? pending.value : hidden.value
})

// Handle approve action
async function handleApprove(appId: string) {
  isActionLoading.value = true
  try {
    await approveApp(appId)
    toast.success('App approved and published successfully')
  } catch (err: any) {
    toast.error(err.message || 'Failed to approve app')
  } finally {
    isActionLoading.value = false
  }
}

// Handle reject action
async function handleReject(appId: string) {
  isActionLoading.value = true
  try {
    await rejectApp(appId)
    toast.success('App rejected successfully')
  } catch (err: any) {
    toast.error(err.message || 'Failed to reject app')
  } finally {
    isActionLoading.value = false
  }
}

// Handle hide action
async function handleHide(appId: string) {
  isActionLoading.value = true
  try {
    await hideApp(appId)
    toast.success('App hidden successfully')
  } catch (err: any) {
    toast.error(err.message || 'Failed to hide app')
  } finally {
    isActionLoading.value = false
  }
}

// Fetch data on mount
onMounted(fetchReviewList)
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