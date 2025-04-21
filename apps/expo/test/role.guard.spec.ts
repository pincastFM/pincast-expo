import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUserStore, type UserRole } from '../composables/useUserStore'

// Mock navigateTo
const navigateTo = vi.fn()

vi.mock('#imports', () => ({
  navigateTo
}))

// Mock vue-router types for tests
type RouteRecordNameGeneric = string | symbol | null | undefined;

interface RouteLocationNormalizedGeneric {
  meta: {
    requiresRole?: UserRole | undefined;
  };
  name: RouteRecordNameGeneric;
  path: string;
  fullPath: string;
  params: Record<string, string>;
  query: Record<string, string>;
  hash: string;
  matched: any[];
  redirectedFrom?: RouteLocationNormalizedGeneric;
}

const createMiddlewareContext = (requiresRole?: UserRole): {
  to: RouteLocationNormalizedGeneric,
  from: RouteLocationNormalizedGeneric
} => ({
  from: {
    meta: {},
    name: null,
    path: '/',
    fullPath: '/',
    params: {},
    query: {},
    hash: '',
    matched: []
  },
  to: {
    meta: { requiresRole },
    name: null,
    path: '/test',
    fullPath: '/test',
    params: {},
    query: {},
    hash: '',
    matched: []
  }
})

// Import the middleware
import roleMiddleware from '../middleware/role'

describe('Role Guard Middleware', () => {
  beforeEach(() => {
    // Create a fresh Pinia instance for each test
    setActivePinia(createPinia())
    
    // Reset mocks
    vi.mocked(navigateTo).mockReset()
  })
  
  // @ts-ignore - This is necessary to work around type issues in the test
  it('allows access to unrestricted routes for unauthenticated users', () => {
    const context = createMiddlewareContext()
    // @ts-ignore - This is necessary to work around type issues in the test
    const result = roleMiddleware(context.to, context.from)
    
    expect(result).toBeUndefined()
    expect(navigateTo).not.toHaveBeenCalled()
  })
  
  // @ts-ignore - This is necessary to work around type issues in the test
  it('redirects unauthenticated users to login for restricted routes', () => {
    const context = createMiddlewareContext('developer')
    const userStore = useUserStore()
    userStore.isAuthenticated = false
    
    // @ts-ignore - This is necessary to work around type issues in the test
    roleMiddleware(context.to, context.from)
    
    expect(navigateTo).toHaveBeenCalledWith('/login', { replace: true })
  })
  
  // @ts-ignore - This is necessary to work around type issues in the test
  it('allows players to access player routes', () => {
    const context = createMiddlewareContext('player')
    const userStore = useUserStore()
    userStore.isAuthenticated = true
    userStore.role = 'player'
    
    // @ts-ignore - This is necessary to work around type issues in the test
    const result = roleMiddleware(context.to, context.from)
    
    expect(result).toBeUndefined()
    expect(navigateTo).not.toHaveBeenCalled()
  })
  
  // @ts-ignore - This is necessary to work around type issues in the test
  it('redirects players trying to access developer routes', () => {
    const context = createMiddlewareContext('developer')
    const userStore = useUserStore()
    userStore.isAuthenticated = true
    userStore.role = 'player'
    
    // @ts-ignore - This is necessary to work around type issues in the test
    roleMiddleware(context.to, context.from)
    
    expect(navigateTo).toHaveBeenCalledWith('/unauthorized', { replace: true })
  })
  
  // @ts-ignore - This is necessary to work around type issues in the test
  it('allows developers to access player and developer routes', () => {
    const userStore = useUserStore()
    userStore.isAuthenticated = true
    userStore.role = 'developer'
    
    // Test player route
    const playerContext = createMiddlewareContext('player')
    // @ts-ignore - This is necessary to work around type issues in the test
    const playerResult = roleMiddleware(playerContext.to, playerContext.from)
    expect(playerResult).toBeUndefined()
    expect(navigateTo).not.toHaveBeenCalled()
    
    // Test developer route
    const devContext = createMiddlewareContext('developer')
    // @ts-ignore - This is necessary to work around type issues in the test
    const devResult = roleMiddleware(devContext.to, devContext.from)
    expect(devResult).toBeUndefined()
    expect(navigateTo).not.toHaveBeenCalled()
  })
  
  // @ts-ignore - This is necessary to work around type issues in the test
  it('redirects developers trying to access staff routes', () => {
    const context = createMiddlewareContext('staff')
    const userStore = useUserStore()
    userStore.isAuthenticated = true
    userStore.role = 'developer'
    
    // @ts-ignore - This is necessary to work around type issues in the test
    roleMiddleware(context.to, context.from)
    
    expect(navigateTo).toHaveBeenCalledWith('/unauthorized', { replace: true })
  })
  
  // @ts-ignore - This is necessary to work around type issues in the test
  it('allows staff to access all routes', () => {
    const userStore = useUserStore()
    userStore.isAuthenticated = true
    userStore.role = 'staff'
    
    // Test player route
    const playerContext = createMiddlewareContext('player')
    // @ts-ignore - This is necessary to work around type issues in the test
    const playerResult = roleMiddleware(playerContext.to, playerContext.from)
    expect(playerResult).toBeUndefined()
    expect(navigateTo).not.toHaveBeenCalled()
    
    // Test developer route
    const devContext = createMiddlewareContext('developer')
    // @ts-ignore - This is necessary to work around type issues in the test
    const devResult = roleMiddleware(devContext.to, devContext.from)
    expect(devResult).toBeUndefined()
    expect(navigateTo).not.toHaveBeenCalled()
    
    // Test staff route
    const staffContext = createMiddlewareContext('staff')
    // @ts-ignore - This is necessary to work around type issues in the test
    const staffResult = roleMiddleware(staffContext.to, staffContext.from)
    expect(staffResult).toBeUndefined()
    expect(navigateTo).not.toHaveBeenCalled()
  })
  
  // @ts-ignore - This is necessary to work around type issues in the test
  it('defaults to player role when token lacks role claim', () => {
    const userStore = useUserStore()
    userStore.id = 'test-id'
    userStore.email = 'test@example.com'
    userStore.isAuthenticated = true
    
    // By default, should be 'player'
    expect(userStore.role).toBe('player')
    
    // Should pass player routes
    const playerContext = createMiddlewareContext('player')
    // @ts-ignore - This is necessary to work around type issues in the test
    const playerResult = roleMiddleware(playerContext.to, playerContext.from)
    expect(playerResult).toBeUndefined()
    
    // Should fail developer routes
    const devContext = createMiddlewareContext('developer')
    // @ts-ignore - This is necessary to work around type issues in the test
    roleMiddleware(devContext.to, devContext.from)
    expect(navigateTo).toHaveBeenCalledWith('/unauthorized', { replace: true })
  })
})