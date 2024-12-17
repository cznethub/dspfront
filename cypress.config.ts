import { defineConfig } from "cypress";
import vitePreprocessor from "cypress-vite";

export default defineConfig({
  e2e: {
    baseUrl: "https://127.0.0.1",
    chromeWebSecurity: false,
    specPattern: "cypress/e2e/**/*.spec.*",
    supportFile: false,
    setupNodeEvents(on) {
      on("file:preprocessor", vitePreprocessor());
    },
  },
  component: {
    devServer: {
      framework: "vue-cli",
      bundler: "webpack",
    },
  },
});
