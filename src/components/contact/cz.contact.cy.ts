import CzContact from "./cz.contact.vue";
import { i18n } from "@/main";

describe("<CzContact />", () => {
  it("renders", () => {
    // see: https://on.cypress.io/mounting-vue
    // @ts-ignore
    cy.mount(CzContact, { i18n });
  });
});
