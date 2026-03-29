/// <reference types="cypress" />
/// <reference path="../support/commands.ts" />

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function visitSubmissions() {
  cy.visit('/submissions')
  cy.contains('My Submissions').should('exist')
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------
describe('Submissions page — empty state', () => {
  beforeEach(() => {
    cy.login()
    cy.stubApi() // GET /api/submissions returns []
    visitSubmissions()
  })

  it('shows the My Submissions heading', () => {
    cy.contains('My Submissions').should('be.visible')
  })

  it('shows the Register Datasets button', () => {
    cy.contains('Register Datasets').should('be.visible')
  })

  it('does not render the search field when there are no submissions', () => {
    cy.get('#my_submissions_search').should('not.exist')
  })

  it('does not render the repository filter when there are no submissions', () => {
    // The filter select is only rendered when submissions.length > 0
    cy.contains('Repository').should('not.exist')
  })
})

// ---------------------------------------------------------------------------
// Populated state
// ---------------------------------------------------------------------------
describe('Submissions page — with submissions', () => {
  beforeEach(() => {
    cy.login()
    cy.stubApiWithSubmissions()
    visitSubmissions()
    cy.wait('@submissions')
  })

  it('shows the correct total count', () => {
    cy.get('#total_submissions').should('contain.text', '3 Total Submissions')
  })

  it('renders each submission title', () => {
    cy.contains('Critical Zone Observatory Hydrology Data 2023').should('exist')
    cy.contains('Soil Geochemistry at Rocky Mountain CZO').should('exist')
    cy.contains('Watershed Sensor Time Series 2022-2023').should('exist')
  })

  it('shows the search field', () => {
    cy.get('#my_submissions_search').should('be.visible')
  })

  it('shows the repository filter', () => {
    cy.contains('Repository').should('be.visible')
  })

  it('filters submissions by search text', () => {
    cy.get('#my_submissions_search').type('Hydrology')
    cy.contains('Critical Zone Observatory Hydrology Data 2023').should('exist')
    cy.contains('Soil Geochemistry at Rocky Mountain CZO').should('not.exist')
    cy.contains('Watershed Sensor Time Series 2022-2023').should('not.exist')
  })

  it('shows all results after clearing the search', () => {
    cy.get('#my_submissions_search').type('Hydrology')
    cy.contains('Soil Geochemistry at Rocky Mountain CZO').should('not.exist')
    cy.get('#my_submissions_search').clear()
    cy.contains('Soil Geochemistry at Rocky Mountain CZO').should('exist')
    cy.contains('Watershed Sensor Time Series 2022-2023').should('exist')
  })

  it('shows a result count when a filter is active', () => {
    cy.get('#my_submissions_search').type('Soil')
    cy.contains('1 Results').should('exist')
  })

  it('Register Datasets button is still visible with submissions', () => {
    cy.contains('Register Datasets').should('be.visible')
  })
})

// ---------------------------------------------------------------------------
// Register Datasets dialog (triggered from the submissions page)
// ---------------------------------------------------------------------------
describe('Submissions page — Register Datasets dialog', () => {
  beforeEach(() => {
    cy.login()
    cy.stubApi()
    visitSubmissions()
  })

  it('opens the dialog when clicking Register Datasets', () => {
    cy.contains('Register Datasets').click()
    cy.contains('Register Dataset').should('be.visible')
  })

  it('shows the Supported Repository and Other options', () => {
    cy.contains('Register Datasets').click()
    cy.contains('SUPPORTED REPOSITORY').should('exist')
    cy.contains('OTHER').should('exist')
  })

  it('closes the dialog on Cancel', () => {
    cy.contains('Register Datasets').click()
    cy.contains('Register Dataset').should('be.visible')
    cy.contains('Cancel').click()
    cy.contains('Register Dataset').should('not.exist')
  })

  it('navigates to /register when SUPPORTED REPOSITORY card is clicked', () => {
    cy.contains('Register Datasets').click()
    // The supported-repo card is a router-link to /register
    cy.contains('SUPPORTED REPOSITORY').closest('[href]').click()
    cy.url().should('include', '/register')
  })
})

// ---------------------------------------------------------------------------
// Refresh a submission
// ---------------------------------------------------------------------------
describe('Submissions page — refresh submission', () => {
  beforeEach(() => {
    cy.login()
    cy.stubApiWithSubmissions()
    // Stub the refresh endpoint before visiting
    cy.intercept('GET', '/api/submission/**', { statusCode: 200, body: {} }).as('refreshCall')
    visitSubmissions()
    cy.wait('@submissions')
  })

  it('calls the refresh API endpoint when Refresh is clicked', () => {
    cy.get('[title="Refresh"]').first().click()
    cy.wait('@refreshCall')
  })
})

// ---------------------------------------------------------------------------
// Delete submission flow
// ---------------------------------------------------------------------------
describe('Submissions page — delete submission', () => {
  beforeEach(() => {
    cy.login()
    cy.stubApiWithSubmissions()
    visitSubmissions()
    cy.wait('@submissions')
  })

  it('opens the delete confirmation dialog when Delete is clicked', () => {
    cy.get('[title="Delete"]').first().click()
    // A confirmation dialog should appear
    cy.contains('Delete').should('be.visible')
    cy.contains('Cancel').should('be.visible')
  })

  it('cancels deletion and keeps the submission', () => {
    cy.get('[title="Delete"]').first().click()
    cy.contains('Cancel').click()
    cy.get('#total_submissions').should('contain.text', '3 Total Submissions')
  })
})
