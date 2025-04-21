describe('Staff Review Dashboard', () => {
  beforeEach(() => {
    // Mock staff login
    cy.intercept('GET', '/api/user/me', {
      statusCode: 200,
      body: {
        id: 'staff-user-id',
        email: 'staff@pincast.fm',
        role: 'staff'
      }
    }).as('getUserProfile');
    
    // Mock pending apps list
    cy.intercept('GET', '/api/review/list', {
      statusCode: 200,
      body: {
        pending: [
          {
            id: 'test-app-1',
            title: 'Test Pending App',
            slug: 'test-app',
            state: 'pending',
            heroUrl: null,
            createdAt: new Date().toISOString(),
            isPaid: false,
            owner: {
              id: 'dev-user-id',
              email: 'developer@example.com'
            },
            latestVersion: {
              id: 'version-1',
              semver: '0.1.0',
              deployUrl: 'https://example.com/app',
              lighthouseScore: 85
            }
          }
        ],
        hidden: []
      }
    }).as('getReviewList');
    
    // Mock state update
    cy.intercept('PATCH', '/api/review/test-app-1/state', {
      statusCode: 200,
      body: {
        success: true,
        app: {
          id: 'test-app-1',
          state: 'published'
        },
        message: "App state changed from 'pending' to 'published'"
      }
    }).as('updateAppState');
    
    // Visit the review dashboard
    cy.visit('/review');
    cy.wait('@getUserProfile');
    cy.wait('@getReviewList');
  });
  
  it('should display pending apps in the review dashboard', () => {
    cy.contains('App Review Dashboard').should('be.visible');
    cy.contains('Pending').should('be.visible');
    cy.contains('Test Pending App').should('be.visible');
    cy.contains('developer@example.com').should('be.visible');
  });
  
  it('should allow approving an app from the list', () => {
    cy.contains('Approve').click();
    cy.wait('@updateAppState');
    
    // Should show a success toast
    cy.contains('App approved and published successfully').should('be.visible');
    
    // App should be removed from the list after approval
    cy.contains('No apps to review in this category').should('be.visible');
  });
  
  it('should navigate to app details page', () => {
    // Mock app details endpoint
    cy.intercept('GET', '/api/review/test-app-1', {
      statusCode: 200,
      body: {
        id: 'test-app-1',
        title: 'Test Pending App',
        slug: 'test-app',
        state: 'pending',
        heroUrl: null,
        createdAt: new Date().toISOString(),
        isPaid: false,
        owner: {
          id: 'dev-user-id',
          email: 'developer@example.com'
        },
        versions: [
          {
            id: 'version-1',
            semver: '0.1.0',
            deployUrl: 'https://example.com/app',
            lighthouseScore: 85,
            createdAt: new Date().toISOString()
          }
        ]
      }
    }).as('getAppDetails');
    
    cy.contains('Details').click();
    cy.wait('@getAppDetails');
    
    // Should show app details
    cy.url().should('include', '/review/test-app-1');
    cy.contains('Test Pending App').should('be.visible');
    cy.contains('v0.1.0').should('be.visible');
    cy.get('iframe').should('have.attr', 'src', 'https://example.com/app');
    
    // Should have approval button
    cy.contains('button', 'Approve').should('be.visible');
  });
});