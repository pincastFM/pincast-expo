import { defineStore } from 'pinia'

export type UserRole = 'player' | 'developer' | 'staff'

interface UserState {
  id: string | null
  email: string | null
  role: UserRole
  isAuthenticated: boolean
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    id: null,
    email: null,
    role: 'player', // Default role
    isAuthenticated: false
  }),
  
  actions: {
    setUser(userData: { id: string; email: string | null; role?: UserRole }) {
      this.id = userData.id
      this.email = userData.email
      this.role = userData.role || 'player' // Default to 'player' if no role provided
      this.isAuthenticated = true
    },
    
    clearUser() {
      this.id = null
      this.email = null
      this.role = 'player'
      this.isAuthenticated = false
    },
    
    hasRole(requiredRole: UserRole): boolean {
      if (!this.isAuthenticated) return false
      
      // Staff can access everything
      if (this.role === 'staff') return true
      
      // Developers can access developer and player routes
      if (this.role === 'developer' && requiredRole === 'player') return true
      if (this.role === 'developer' && requiredRole === 'developer') return true
      
      // Players can only access player routes
      if (this.role === 'player' && requiredRole === 'player') return true
      
      return false
    }
  }
})