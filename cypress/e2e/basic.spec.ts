context('Basic', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('basic nav', () => {
    cy.url()
      .should('eq', 'https://localhost/')

    // cy.get('#input')
    //   .type('Vitesse{Enter}')
    //   .url()
    //   .should('eq', 'http://localhost/hi/Vitesse')
  })
})
