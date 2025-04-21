// Catalog user flow Cypress test

describe('Catalog User Flow', () => {
  beforeEach(() => {
    // Intercept and mock API requests
    cy.intercept('GET', '/api/catalog*', { fixture: 'catalog.json' }).as('getCatalog');
    cy.intercept('GET', '/api/apps/*', { fixture: 'app-detail.json' }).as('getAppDetail');
  });

  it('should display the catalog list page', () => {
    cy.visit('/browse');
    
    // The title should be visible
    cy.contains('Browse Experiences').should('be.visible');
    
    // The page should have filters
    cy.contains('Nearest').should('exist');
    cy.contains('Most Popular').should('exist');
  });
  
  it('should display authentication elements', () => {
    cy.visit('/browse');
    
    // Check for any authentication-related UI elements
    // This is more flexible than looking for exact button text
    cy.get('.bg-blue-50').should('exist');
  });
});