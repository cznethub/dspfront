context('Basic', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('basic nav', () => {
    cy.url()
      .should('eq', 'http://localhost')

    // cy.get('#input')
    //   .type('Vitesse{Enter}')
    //   .url()
    //   .should('eq', 'http://localhost/hi/Vitesse')
  })
})
