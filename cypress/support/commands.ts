/// <reference types="cypress" />
/// <reference path="../../cypress.d.ts" />

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const PINIA_USER_KEY = 'cz-hub-user'

// ---------------------------------------------------------------------------
// Commands
// ---------------------------------------------------------------------------

/**
 * Seeds the Pinia user store's localStorage entry so the app boots as an
 * authenticated user without going through the ORCID OAuth flow.
 *
 * Must be called before cy.visit() — Cypress sets localStorage for the
 * current origin (baseUrl) before the page load.
 */
Cypress.Commands.add('login', () => {
  const piniaUserState = {
    isLoggedIn: true,
    orcid: '0000-0000-0000-0000',
    orcidAccessToken: 'fake-cypress-token',
    next: '',
    hasUnsavedChanges: false,
    isSaving: false,
    registeringSubmission: null,
    showSubmissionWarning: true,
  }
  localStorage.setItem(PINIA_USER_KEY, JSON.stringify(piniaUserState))
})

/**
 * Intercepts the three API endpoints the app fires on mount for authenticated
 * sessions:
 *   GET /api          — checkAuthorization()  → 200 keeps the session alive
 *   GET /api/urls/**  — repositoryStore.init() → returns minimal payload
 *   GET /api/submissions* — fetchSubmissions() → returns empty array
 */
Cypress.Commands.add('stubApi', () => {
  // Regex patterns are used instead of { pathname } matchers because Cypress's
  // pathname matching does not reliably intercept requests that include a query
  // string (e.g. ?access_token=...). Regexes match against the full URL and
  // are unambiguous.
  //
  //   /\/api(\?|$)/         — matches /api  or /api?...  (not /api/anything)
  //   /\/api\/urls\//       — matches /api/urls/<key>  (with or without query)
  //   /\/api\/submissions(\?|$)/ — matches /api/submissions or /api/submissions?...
  cy.intercept({ method: 'GET', url: /\/api(\?|$)/ }, { statusCode: 200 }).as('authCheck')
  cy.intercept({ method: 'GET', url: /\/api\/urls\// }, { statusCode: 200, body: {} }).as('repoUrls')
  cy.intercept({ method: 'GET', url: /\/api\/submissions(\?|$)/ }, { statusCode: 200, body: [] }).as('submissions')
})

/**
 * Like stubApi() but returns the submissions fixture for GET /api/submissions.
 */
Cypress.Commands.add('stubApiWithSubmissions', () => {
  cy.intercept({ method: 'GET', url: /\/api(\?|$)/ }, { statusCode: 200 }).as('authCheck')
  cy.intercept({ method: 'GET', url: /\/api\/urls\// }, { statusCode: 200, body: {} }).as('repoUrls')
  cy.intercept({ method: 'GET', url: /\/api\/submissions(\?|$)/ }, { fixture: 'submissions.json' }).as('submissions')
})
