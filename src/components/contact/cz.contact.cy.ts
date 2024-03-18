import CzContact from './cz.contact.vue'
import { i18n } from '~/modules/i18n'

describe('<CzContact />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-vue
    // @ts-expect-error
    cy.mount(CzContact, { i18n })
  })
})
