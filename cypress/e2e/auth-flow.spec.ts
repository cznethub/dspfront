/// <reference types="cypress" />
import '../support/commands'

describe('Auth flow', () => {
  describe('Unauthenticated access', () => {
    it('redirects /submissions to home when not logged in', () => {
      cy.visit('/submissions')
      cy.url().should('match', /\/$/)
    })

    it('redirects /profile to home when not logged in', () => {
      cy.visit('/profile')
      cy.url().should('match', /\/$/)
    })

    it('renders the login dialog with ORCID button', () => {
      // Visiting a guarded route triggers the login dialog via User.logInDialog$
      cy.visit('/submissions')
      cy.get('.cz-login').should('be.visible')
      cy.get('#orcid_login_continue').should('be.visible')
      cy.get('#orcid_login_continue').should('contain.text', 'ORCID')
    })
  })

  describe('Authenticated access', () => {
    beforeEach(() => {
      cy.login()
    })

    it('allows access to /submissions when authenticated', () => {
      cy.visit('/submissions')
      cy.url().should('include', '/submissions')
      // The submissions page should render its content, not redirect
      cy.contains('My Submissions').should('exist')
    })

    it('allows access to /profile when authenticated', () => {
      cy.visit('/profile')
      cy.url().should('include', '/profile')
    })
  })
})
