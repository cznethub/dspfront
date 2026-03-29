/// <reference types="cypress" />
/// <reference path="../support/commands.ts" />

// ---------------------------------------------------------------------------
// /register-data landing page
// ---------------------------------------------------------------------------
describe('Register Data landing page', () => {
  beforeEach(() => {
    cy.login()
    cy.stubApi()
    cy.visit('/register-data')
  })

  it('renders the page heading', () => {
    cy.contains('Register Data').should('be.visible')
  })

  it('shows the "Help Me Decide" button linking to recommendations', () => {
    cy.contains('Help Me Decide').should('exist')
    cy.contains('Help Me Decide').closest('a, button').should('exist')
  })

  it('renders the Repositories section', () => {
    cy.contains('Repositories').should('exist')
  })

  it('renders repository cards', () => {
    cy.get('.cz-repository-submit-card').should('have.length.gte', 3)
  })

  it('shows a HydroShare card', () => {
    cy.contains('HydroShare').should('exist')
  })

  it('shows an EarthChem card', () => {
    cy.contains('EarthChem').should('exist')
  })

  it('shows a Register Samples card', () => {
    cy.contains('Register Samples').should('exist')
  })

  it('shows the external / "Other" registration card', () => {
    // The external card is above the grid and links to registering datasets
    // from any repository
    cy.get('.cz-repository-submit-card').first().should('exist')
  })
})

// ---------------------------------------------------------------------------
// Register Dataset dialog (opened from the external-repo card)
// ---------------------------------------------------------------------------
describe('Register Dataset dialog on /register-data', () => {
  beforeEach(() => {
    cy.login()
    cy.stubApi()
    cy.visit('/register-data')
  })

  it('opens the Register Dataset dialog when the external card is clicked', () => {
    // The external card fires openRegisterDatasetDialog on click
    cy.get('.cz-repository-submit-card').first().click()
    cy.contains('Register Dataset').should('be.visible')
  })

  it('dialog shows Supported Repository and Other options', () => {
    cy.get('.cz-repository-submit-card').first().click()
    cy.contains('SUPPORTED REPOSITORY').should('exist')
    cy.contains('OTHER').should('exist')
  })

  it('dialog Cancel button dismisses it', () => {
    cy.get('.cz-repository-submit-card').first().click()
    cy.contains('Register Dataset').should('be.visible')
    cy.contains('Cancel').click()
    cy.contains('Register Dataset').should('not.exist')
  })
})

// ---------------------------------------------------------------------------
// "Help Me Decide" link
// ---------------------------------------------------------------------------
describe('"Help Me Decide" navigation', () => {
  beforeEach(() => {
    cy.login()
    cy.stubApi()
    cy.visit('/register-data')
  })

  it('navigates to the recommendations questionnaire', () => {
    cy.contains('Help Me Decide').click()
    cy.url().should('include', '/resources/recommendations')
    cy.contains('Repository Recommendations').should('exist')
  })
})
