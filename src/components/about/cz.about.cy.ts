import CzAbout from "./cz.about.vue";
import { i18n } from "@/main";

describe("<CzAbout />", () => {
  it("renders", () => {
    // see: https://on.cypress.io/mounting-vue
    // @ts-ignore
    cy.mount(CzAbout, { i18n });
  });
});
