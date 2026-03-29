/// <reference types="cypress" />
/// <reference path="../support/commands.ts" />

describe('Auth flow', () => {
  // -----------------------------------------------------------------------
  // Unauthenticated users
  // -----------------------------------------------------------------------
  describe('Unauthenticated', () => {
    beforeEach(() => {
      cy.clearAllLocalStorage()
      cy.viewport(1440, 900)
      // App.vue always calls checkAuthorization() on mount. Without a stub the
      // request hangs indefinitely, keeping isLoading=true and blocking Cypress.
      cy.intercept('GET', { pathname: '/api' }, { statusCode: 401 }).as('authCheck')
      cy.intercept('GET', { pathname: '/api/urls/**' }, { statusCode: 401 }).as('repoUrls')
      cy.intercept('GET', { pathname: '/api/submissions' }, { statusCode: 401 }).as('submissions')
    })

    it('redirects /submissions to home', () => {
      cy.visit('/submissions')
      cy.url().should('match', /\/$/)
    })

    it('redirects /profile to home', () => {
      cy.visit('/profile')
      cy.url().should('match', /\/$/)
    })

    it('redirects /register to home', () => {
      cy.visit('/register')
      cy.url().should('match', /\/$/)
    })

    // The login dialog is opened via an RxJS Subject that App.vue subscribes to
    // in onMounted. On a hard page-load the guard fires before the subscription
    // exists, so we must trigger in-app navigation (after the app is mounted).
    it('shows the login dialog when a guarded nav link is clicked', () => {
      cy.visit('/')
      // Target the desktop nav button by its generated id (avoids the hidden mobile drawer item)
      cy.get('#navbar-nav-MySubmissions').click()
      cy.url().should('match', /\/$/)
      cy.get('.cz-login').should('be.visible')
      cy.get('#orcid_login_continue').should('contain.text', 'ORCID')
    })

    it('shows the login dialog when the Log In button is clicked', () => {
      cy.visit('/')
      cy.get('#navbar-login').click()
      cy.get('.cz-login').should('be.visible')
    })

    it('login dialog has a Cancel button', () => {
      cy.visit('/')
      cy.get('#navbar-login').click()
      cy.get('.cz-login').contains('Cancel').should('be.visible')
    })
  })

  // -----------------------------------------------------------------------
  // Authenticated users
  // -----------------------------------------------------------------------
  describe('Authenticated', () => {
    beforeEach(() => {
      cy.login()
      cy.stubApi()
    })

    it('allows access to /submissions', () => {
      cy.visit('/submissions')
      cy.url().should('include', '/submissions')
      cy.contains('My Submissions').should('exist')
    })

    it('allows access to /profile', () => {
      cy.visit('/profile')
      cy.url().should('include', '/profile')
    })

    it('allows access to /register', () => {
      cy.visit('/register')
      cy.url().should('include', '/register')
    })

    it('auth state persists across a hard reload', () => {
      cy.visit('/submissions')
      cy.contains('My Submissions').should('exist')
      cy.reload()
      // cy.contains() acts as the timing gate: it only resolves once
      // checkAuthorization() completes and isLoading becomes false.
      cy.url().should('include', '/submissions')
      cy.contains('My Submissions', { timeout: 10000 }).should('exist')
    })

    it('does not show the login dialog when already authenticated', () => {
      cy.visit('/submissions')
      cy.get('.cz-login').should('not.exist')
    })
  })
})
