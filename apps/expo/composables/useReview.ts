import { ref } from 'vue'
import { useFetch, useAsyncData } from '#imports'
import type { App, AppState, Version } from '~/server/db/schema'

// Using a more detailed and precise type definition to prevent TypeScript exact optional errors
export interface AppWithOwner extends Omit<App, 'owner' | 'latestVersion'> {
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
  } | undefined
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
        // Transform the raw data into properly typed objects
        pending.value = (data.value.pending || []).map((item: any): AppWithOwner => ({
          // Ensure all required App properties are present
          id: item.id || '',
          ownerId: item.ownerId || (item.owner?.id || ''),
          title: item.title || '',
          slug: item.slug || '',
          heroUrl: item.heroUrl,
          category: item.category,
          priceCents: typeof item.priceCents === 'number' ? item.priceCents : 0,
          isPaid: Boolean(item.isPaid),
          state: (item.state || 'pending') as AppState,
          createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
          // Add owner and latestVersion from the fetched data
          owner: {
            id: item.owner?.id || '',
            email: item.owner?.email || null
          },
          latestVersion: item.latestVersion ? {
            id: item.latestVersion.id || '',
            appId: item.latestVersion.appId || '',
            createdAt: item.latestVersion.createdAt ? new Date(item.latestVersion.createdAt) : new Date(),
            semver: item.latestVersion.semver || '0.0.0',
            changelog: item.latestVersion.changelog || null,
            lighthouseScore: item.latestVersion.lighthouseScore || null,
            repoUrl: item.latestVersion.repoUrl || null,
            deployUrl: item.latestVersion.deployUrl || null
          } : undefined
        }))

        hidden.value = (data.value.hidden || []).map((item: any): AppWithOwner => ({
          // Ensure all required App properties are present
          id: item.id || '',
          ownerId: item.ownerId || (item.owner?.id || ''),
          title: item.title || '',
          slug: item.slug || '',
          heroUrl: item.heroUrl,
          category: item.category,
          priceCents: typeof item.priceCents === 'number' ? item.priceCents : 0,
          isPaid: Boolean(item.isPaid),
          state: (item.state || 'hidden') as AppState,
          createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
          // Add owner and latestVersion from the fetched data
          owner: {
            id: item.owner?.id || '',
            email: item.owner?.email || null
          },
          latestVersion: item.latestVersion ? {
            id: item.latestVersion.id || '',
            appId: item.latestVersion.appId || '',
            createdAt: item.latestVersion.createdAt ? new Date(item.latestVersion.createdAt) : new Date(),
            semver: item.latestVersion.semver || '0.0.0',
            changelog: item.latestVersion.changelog || null,
            lighthouseScore: item.latestVersion.lighthouseScore || null,
            repoUrl: item.latestVersion.repoUrl || null,
            deployUrl: item.latestVersion.deployUrl || null
          } : undefined
        }))
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