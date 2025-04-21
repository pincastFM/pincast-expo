describe('Analytics and Popularity', () => {
  beforeEach(() => {
    // Intercept catalog API requests
    cy.intercept('GET', '/api/catalog*').as('getCatalog');
  });

  it('should display popularity metrics and sort by popularity by default', () => {
    // Visit the browse page
    cy.visit('/browse');

    // Wait for the catalog API to be called
    cy.wait('@getCatalog').then((interception) => {
      // Verify popularity sort parameter was sent
      const url = new URL(interception.request.url);
      expect(url.searchParams.get('sort')).to.equal('popularity');
    });

    // Check that the "Most Popular" sort option is selected by default
    cy.contains('button', 'Most Popular')
      .should('have.class', 'bg-blue-600');

    // Each card should display the play count
    cy.get('.catalog-item').each(($item) => {
      cy.wrap($item).find('span.inline-flex')
        .should(($el) => {
          expect($el.text()).to.satisfy((text: string) => 
            text.includes('plays this week') || text.includes('play this week')
          );
        });
    });
  });

  it('should allow changing sort options', () => {
    // Visit the browse page
    cy.visit('/browse');

    // Change to "Nearest" sort option
    cy.contains('button', 'Nearest').click();

    // Wait for the catalog API to be called with the new sort
    cy.wait('@getCatalog').then((interception) => {
      const url = new URL(interception.request.url);
      expect(url.searchParams.get('sort')).to.equal('distance');
    });

    // Change to "Newest" sort option
    cy.contains('button', 'Newest').click();

    // Wait for the catalog API to be called with the new sort
    cy.wait('@getCatalog').then((interception) => {
      const url = new URL(interception.request.url);
      expect(url.searchParams.get('sort')).to.equal('newest');
    });

    // Change back to "Most Popular" sort option
    cy.contains('button', 'Most Popular').click();

    // Wait for the catalog API to be called with the new sort
    cy.wait('@getCatalog').then((interception) => {
      const url = new URL(interception.request.url);
      expect(url.searchParams.get('sort')).to.equal('popularity');
    });
  });

  it('should display items in order of popularity', () => {
    // Mock the catalog API response to ensure known popularity order
    cy.intercept('GET', '/api/catalog?sort=popularity', {
      statusCode: 200,
      body: [
        { id: '1', title: 'Most Popular App', slug: 'most-popular', heroUrl: null, sessions7d: 100 },
        { id: '2', title: 'Second Popular App', slug: 'second-popular', heroUrl: null, sessions7d: 50 },
        { id: '3', title: 'Third Popular App', slug: 'third-popular', heroUrl: null, sessions7d: 25 }
      ]
    }).as('getMockedCatalog');

    // Visit the browse page
    cy.visit('/browse');

    // Wait for our mocked response
    cy.wait('@getMockedCatalog');

    // Verify the order matches popularity
    cy.get('.catalog-item').eq(0).should('contain', 'Most Popular App').and('contain', '100 plays');
    cy.get('.catalog-item').eq(1).should('contain', 'Second Popular App').and('contain', '50 plays');
    cy.get('.catalog-item').eq(2).should('contain', 'Third Popular App').and('contain', '25 plays');
  });
});