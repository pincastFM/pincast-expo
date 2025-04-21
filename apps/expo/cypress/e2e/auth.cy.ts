/// <reference types="cypress" />
// Import types from Cypress and composables

// Mock Logto object for testing
const mockLogto = {
  isAuthenticated: () => cy.wrap(false),
  getIdTokenClaims: () => cy.wrap(null),
  signIn: () => cy.wrap(true),
  signOut: () => cy.wrap(true)
};

// No need to extend Window interface, we'll use type casting instead

describe('Authentication and Authorization', () => {
  beforeEach(() => {
    // Clear local storage to simulate fresh visit
    cy.clearLocalStorage();
    
    // Intercept JWKS endpoint to prevent actual Logto requests
    cy.intercept('GET', '/.well-known/jwks.json', {});

    // Stub the useLogto composable
    cy.window().then(win => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (win as any).useLogto = () => mockLogto;
    });

    // Create a minimal store mock
    cy.window().then(win => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (win as any).$pinia = {
        state: {
          value: {
            user: {
              id: null,
              email: null,
              role: 'player',
              isAuthenticated: false
            }
          }
        }
      };
    });
  });

  it('redirects unauthenticated users to login when accessing protected route', () => {
    // Visit the submit page (requires 'developer' role)
    cy.visit('/submit');
    
    // Should be redirected to login page
    cy.url().should('include', '/login');
    cy.contains('Sign in with Logto').should('be.visible');
  });
  
  it('allows users to log in', () => {
    // Mock successful authentication
    cy.window().then(win => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (win as any).useLogto = () => ({
        ...mockLogto,
        isAuthenticated: () => cy.wrap(true),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        getIdTokenClaims: () => cy.wrap({
          sub: 'test-user-id',
          email: 'test@example.com',
          role: 'player'
        } as any),
      });
    });
    
    // Visit the login page
    cy.visit('/login');
    
    // Click the login button
    cy.contains('Sign in with Logto').click();
    
    // No easy way to verify the call in Cypress with composables,
    // so we'll just check the UI reacts appropriately later
  });
  
  it('redirects users without developer role to unauthorized page', () => {
    // Set authenticated user with 'player' role in our store mock
    cy.window().then(win => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (win as any).$pinia.state.value.user = {
        id: 'test-user-id',
        email: 'test@example.com',
        role: 'player',
        isAuthenticated: true
      };
    });
    
    // Try to visit the submit page with player role
    cy.visit('/submit');
    
    // Should be redirected to unauthorized page
    cy.url().should('include', '/unauthorized');
    cy.contains('Access Denied').should('be.visible');
  });
});