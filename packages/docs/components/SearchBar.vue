<template>
  <div class="relative w-64">
    <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
      <IconSearch class="w-4 h-4 text-gray-500 dark:text-gray-400" />
    </div>
    <input
      ref="searchInput"
      type="text"
      placeholder="Search docs..."
      class="bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-pincast-blue focus:border-pincast-blue block w-full pl-10 p-2"
      @focus="isSearchOpen = true"
      @keydown.escape="closeSearch"
      @keydown.arrow-down.prevent="navigateResults(1)"
      @keydown.arrow-up.prevent="navigateResults(-1)"
      @keydown.enter.prevent="selectResult"
      v-model="searchQuery"
    />
    
    <!-- Search Results Dropdown -->
    <div
      v-if="isSearchOpen && searchResults.length > 0"
      class="absolute z-10 mt-2 w-full bg-white dark:bg-gray-900 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto"
    >
      <ul class="py-1">
        <li
          v-for="(result, index) in searchResults"
          :key="index"
          :class="{ 'bg-gray-100 dark:bg-gray-800': selectedIndex === index }"
          @mouseenter="selectedIndex = index"
          @click="navigateToResult(result)"
          class="px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <div class="font-medium text-pincast-blue">{{ result.title }}</div>
          <div class="text-xs text-gray-500 dark:text-gray-400 truncate">{{ result.path }}</div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'

// Note: This is a simplified search implementation
// In a real app, you would use something like Algolia DocSearch

const searchQuery = ref('')
const isSearchOpen = ref(false)
const searchResults = ref<Array<{ title: string; path: string; content?: string }>>([])
const selectedIndex = ref(0)
const searchInput = ref<HTMLInputElement | null>(null)

// Mock search function - in production this would be replaced with actual search API
watch(searchQuery, async (query) => {
  if (!query.trim()) {
    searchResults.value = []
    return
  }
  
  // Simulate API call with local search
  const results = [
    { title: 'Getting Started', path: '/getting-started', content: 'Learn how to get started with Pincast Expo' },
    { title: 'SDK Authentication', path: '/sdk/auth', content: 'Authenticate users with the Pincast SDK' },
    { title: 'useAuth Composable', path: '/sdk/auth', content: 'The useAuth composable provides authentication functions' },
    { title: 'usePincastLocation', path: '/sdk/location', content: 'Get user location with the Pincast SDK' },
    { title: 'Creating Your First App', path: '/tutorials/quest', content: 'Build a quest app with Pincast' }
  ].filter(item => 
    item.title.toLowerCase().includes(query.toLowerCase()) || 
    item.content?.toLowerCase().includes(query.toLowerCase())
  )
  
  searchResults.value = results
  selectedIndex.value = 0
})

function closeSearch() {
  isSearchOpen.value = false
  searchQuery.value = ''
}

function navigateResults(direction: number) {
  if (searchResults.value.length === 0) return
  
  // Calculate new index with wrapping
  const newIndex = selectedIndex.value + direction
  if (newIndex < 0) {
    selectedIndex.value = searchResults.value.length - 1
  } else if (newIndex >= searchResults.value.length) {
    selectedIndex.value = 0
  } else {
    selectedIndex.value = newIndex
  }
}

function selectResult() {
  if (searchResults.value.length > 0) {
    navigateToResult(searchResults.value[selectedIndex.value])
  }
}

function navigateToResult(result: { path: string }) {
  navigateTo(result.path)
  closeSearch()
}

// Close search when clicking outside
function handleClickOutside(event: MouseEvent) {
  if (searchInput.value && !searchInput.value.contains(event.target as Node)) {
    isSearchOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>