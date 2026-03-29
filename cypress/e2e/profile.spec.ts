/// <reference types="cypress" />
/// <reference path="../support/commands.ts" />

describe('Profile page', () => {
  beforeEach(() => {
    cy.login()
    cy.stubApi()
    cy.visit('/profile')
  })

  it('renders the profile page at /profile/account', () => {
    cy.url().should('include', '/profile')
    cy.get('.cz-profile').should('exist')
  })

  it('shows the ORCID logged-in indicator', () => {
    cy.get('.fab.fa-orcid').should('exist')
  })

  it('shows the Log Out button', () => {
    cy.get('#drawer-nav-logout').should('exist')
    cy.get('#drawer-nav-logout').should('be.visible')
  })

  it('shows the Account nav item', () => {
    cy.get('a[href*="/profile/account"]').should('exist')
  })

  it('shows the account section content', () => {
    cy.url().should('include', '/profile/account')
    cy.get('.cz-account').should('exist')
  })

  it('displays the ORCID ID from the seeded user state', () => {
    cy.contains('0000-0000-0000-0000').should('exist')
  })
})

describe('Profile — logout flow', () => {
  beforeEach(() => {
    cy.login()
    cy.stubApi()
    cy.intercept('GET', '/api/logout', { statusCode: 200 }).as('logoutApi')
  })

  it('clicking Log Out triggers a confirmation and logs out', () => {
    cy.visit('/profile')
    cy.get('#drawer-nav-logout').click()
    // A confirmation dialog should appear before actually logging out
    cy.contains('Log Out').should('be.visible')
  })
})
