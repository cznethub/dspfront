import CzContact from './cz.contact.vue'

describe('<CzContact />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-vue
    cy.mount(CzContact)
  })
})