import { ref } from 'vue'
import { useFetch, useAsyncData } from '#imports'
import type { App, AppState, Version } from '~/server/db/schema'

// Using a more detailed and precise type definition to prevent TypeScript exact optional errors
interface AppWithOwner extends Omit<App, 'owner' | 'latestVersion'> {
  owner: {
    id: string
    email: string | null
  }
  latestVersion?: {
    appId: string;
    id: string;
    createdAt: Date;
    semver: string;
    changelog?: string | null;
    lighthouseScore?: number | null;
    repoUrl?: string | null;
    deployUrl?: string | null;
  }
}

interface AppDetail extends AppWithOwner {
  versions: Version[]
}

export function useReview() {
  const pending = ref<AppWithOwner[]>([])
  const hidden = ref<AppWithOwner[]>([])
  const loading = ref(true)
  const error = ref<string | null>(null)

  // Fetch the review list (pending and hidden apps)
  async function fetchReviewList() {
    loading.value = true
    error.value = null

    try {
      const { data } = await useFetch('/api/review/list')
      if (data.value) {
        pending.value = data.value.pending || []
        hidden.value = data.value.hidden || []
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch review list'
      console.error('Error fetching review list:', err)
    } finally {
      loading.value = false
    }
  }

  // Fetch a specific app's details
  async function fetchAppDetails(appId: string) {
    const { data, error: appError } = await useAsyncData(
      `app-${appId}`,
      () => $fetch(`/api/review/${appId}`)
    )

    if (appError.value) {
      console.error('Error fetching app details:', appError.value)
      throw new Error(appError.value?.message || 'Failed to fetch app details')
    }

    return data.value as AppDetail
  }

  // Update an app's state
  async function updateAppState(appId: string, newState: AppState, reason?: string) {
    try {
      const response = await $fetch(`/api/review/${appId}/state`, {
        method: 'PATCH',
        body: {
          state: newState,
          reason: reason || `State changed to ${newState}`
        }
      })

      // Update local lists if the app is in them
      await fetchReviewList()
      
      return response
    } catch (err: any) {
      console.error(`Error updating app state to ${newState}:`, err)
      throw new Error(err.message || `Failed to update app state to ${newState}`)
    }
  }

  // Rollback to a previous version
  async function rollbackVersion(appId: string, versionId: string, reason?: string) {
    try {
      const response = await $fetch(`/api/review/${appId}/rollback`, {
        method: 'POST',
        body: {
          versionId,
          reason: reason || 'Rollback to previous version'
        }
      })
      
      return response
    } catch (err: any) {
      console.error('Error rolling back version:', err)
      throw new Error(err.message || 'Failed to rollback version')
    }
  }

  // Helper functions for common state transitions
  const approveApp = (appId: string, reason?: string) => updateAppState(appId, 'published', reason)
  const rejectApp = (appId: string, reason?: string) => updateAppState(appId, 'rejected', reason)
  const hideApp = (appId: string, reason?: string) => updateAppState(appId, 'hidden', reason)

  return {
    pending,
    hidden,
    loading,
    error,
    fetchReviewList,
    fetchAppDetails,
    updateAppState,
    rollbackVersion,
    approveApp,
    rejectApp,
    hideApp
  }
}