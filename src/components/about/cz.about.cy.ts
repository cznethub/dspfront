import CzAbout from './cz.about.vue'
import { i18n } from '~/modules/i18n'

describe('<CzAbout />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-vue
    // @ts-expect-error
    cy.mount(CzAbout, { i18n })
  })
})
