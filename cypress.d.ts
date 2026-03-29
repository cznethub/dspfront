/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    /**
     * Seed authenticated Pinia user state into localStorage before visiting a
     * page. Bypasses the ORCID OAuth popup entirely.
     */
    login(): Chainable<void>

    /**
     * Set up cy.intercept() stubs for the baseline API calls the app makes on
     * mount when a user is logged in (auth check, repo URL fetches, and an
     * empty submissions list). Call this before cy.visit() in authenticated
     * tests.
     */
    stubApi(): Chainable<void>

    /**
     * Same as stubApi() but seeds GET /api/submissions with the
     * cypress/fixtures/submissions.json fixture instead of an empty array.
     */
    stubApiWithSubmissions(): Chainable<void>
  }
}
