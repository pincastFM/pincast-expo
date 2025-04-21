// ***********************************************************
// This file is processed and loaded automatically before your test files.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

// Mock API responses for @pincast/sdk
Cypress.on('window:load', (win) => {
  // Stub fetch to intercept any SDK API calls
  cy.stub(win, 'fetch').callsFake((url) => {
    if (url.includes('/api/auth')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ authenticated: true })
      });
    }
    
    // Pass other calls through to the original fetch
    return win.fetch.wrappedMethod.apply(win, arguments);
  });
});