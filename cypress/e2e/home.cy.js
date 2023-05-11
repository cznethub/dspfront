/// <reference types="cypress" />
describe('Home page loads', () => {
  beforeEach(() => {
    cy.visit('http://localhost:8080')
  })

  it('displays title', () => {
    cy.get('.v-parallax')
      .should('have.length', 1)
      .should('have.text', 'Data Submission Portal')
  })
})
