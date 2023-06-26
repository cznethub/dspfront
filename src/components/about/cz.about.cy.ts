import CzAbout from './cz.about.vue'

describe('<CzAbout />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-vue
    cy.mount(CzAbout)
  })
})