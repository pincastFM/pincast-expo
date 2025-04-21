import { useUserStore } from '~/composables/useUserStore'
import type { UserRole } from '~/composables/useUserStore'

export default defineNuxtRouteMiddleware((to) => {
  if (process.server) return // Skip middleware execution on server-side

  const userStore = useUserStore()
  const requiredRole = to.meta.requiresRole as UserRole | undefined
  
  // If page doesn't require a role, allow access
  if (!requiredRole) return
  
  // If user isn't authenticated, redirect to login
  if (!userStore.isAuthenticated) {
    return navigateTo('/login', { replace: true })
  }
  
  // Check if user has the required role
  if (!userStore.hasRole(requiredRole)) {
    return navigateTo('/unauthorized', { replace: true })
  }
})