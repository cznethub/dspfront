import { defineConfig } from 'cypress'
import vitePreprocessor from 'cypress-vite'

export default defineConfig({
  e2e: {
    baseUrl: 'http://127.0.0.1:8080',
    chromeWebSecurity: false,
    specPattern: 'cypress/e2e/**/*.spec.*',
    supportFile: false,
    setupNodeEvents(on) {
      on('file:preprocessor', vitePreprocessor())
    },
  },
  component: {
    devServer: {
      framework: 'vue-cli',
      bundler: 'webpack',
    },
  },
})
