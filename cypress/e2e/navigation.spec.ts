/// <reference types="cypress" />
/// <reference path="../support/commands.ts" />

// ---------------------------------------------------------------------------
// Shared helper — stub baseline API calls so the app resolves isLoading=false
// ---------------------------------------------------------------------------
function stubUnauthenticated() {
  cy.clearAllLocalStorage()
  cy.viewport(1440, 900)
  cy.intercept('GET', { pathname: '/api' }, { statusCode: 401 }).as('authCheck')
  cy.intercept('GET', { pathname: '/api/urls/**' }, { statusCode: 401 }).as('repoUrls')
  cy.intercept('GET', { pathname: '/api/submissions' }, { statusCode: 401 }).as('submissions')
}

// ---------------------------------------------------------------------------
// Public routes — accessible without authentication
// ---------------------------------------------------------------------------
describe('Public route navigation', () => {
  beforeEach(stubUnauthenticated)

  it('/ — home renders', () => {
    cy.visit('/')
    cy.url().should('eq', `${Cypress.config().baseUrl}/`)
    cy.get('body').should('be.visible')
  })

  it('/about — renders', () => {
    cy.visit('/about')
    cy.url().should('include', '/about')
    cy.get('body').should('be.visible')
  })

  it('/contact — renders', () => {
    cy.visit('/contact')
    cy.url().should('include', '/contact')
    cy.get('body').should('be.visible')
  })

  it('/resources — renders', () => {
    cy.visit('/resources')
    cy.url().should('include', '/resources')
    cy.get('body').should('be.visible')
  })

  it('/resources/quick-start-guide — renders', () => {
    cy.visit('/resources/quick-start-guide')
    cy.url().should('include', '/resources/quick-start-guide')
    cy.get('body').should('be.visible')
  })

  it('/resources/recommendations — renders questionnaire heading', () => {
    cy.visit('/resources/recommendations')
    cy.url().should('include', '/resources/recommendations')
    cy.contains('Repository Recommendations').should('exist')
  })

  it('/register-data — renders landing page without auth', () => {
    cy.visit('/register-data')
    cy.url().should('include', '/register-data')
    cy.get('body').should('be.visible')
  })
})

// ---------------------------------------------------------------------------
// Unknown routes — catch-all redirect
// ---------------------------------------------------------------------------
describe('Unknown route handling', () => {
  beforeEach(stubUnauthenticated)

  it('redirects an unknown path to home', () => {
    cy.visit('/does-not-exist-xyz-404')
    cy.url().should('match', /\/$/)
  })

  it('redirects a deeply nested unknown path to home', () => {
    cy.visit('/a/b/c/d')
    cy.url().should('match', /\/$/)
  })
})

// ---------------------------------------------------------------------------
// Guarded routes — redirect unauthenticated users
// ---------------------------------------------------------------------------
describe('Guarded route redirects', () => {
  beforeEach(stubUnauthenticated)

  const guardedRoutes = ['/submissions', '/profile', '/register']

  guardedRoutes.forEach((route) => {
    it(`${route} redirects unauthenticated user to /`, () => {
      cy.visit(route)
      cy.url().should('match', /\/$/)
    })
  })
})

// ---------------------------------------------------------------------------
// In-app navigation links (smoke test the top nav)
// ---------------------------------------------------------------------------
describe('App navigation links', () => {
  beforeEach(() => {
    stubUnauthenticated()
    cy.visit('/')
  })

  it('navigates to /about via the About link', () => {
    cy.get('#navbar-nav-About').click()
    cy.url().should('include', '/about')
  })

  it('navigates to /contact via the Contact link', () => {
    cy.get('#navbar-nav-Contact').click()
    cy.url().should('include', '/contact')
  })
})
