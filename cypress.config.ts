import { defineConfig } from 'cypress'
import vitePreprocessor from 'cypress-vite'

export default defineConfig({
  projectId: 'njweyv',
  pageLoadTimeout: 200000,
  e2e: {
    baseUrl: 'https://localhost',
    viewportWidth: 1440,
    viewportHeight: 900,
    chromeWebSecurity: false,
    blockHosts: ['*.googleapis.com', '*.gstatic.com', '*.jsdelivr.net'],
    specPattern: 'cypress/e2e/**/*.spec.*',
    supportFile: 'cypress/support/e2e.ts',
    setupNodeEvents(on) {
      on('file:preprocessor', vitePreprocessor())
    },
  },
})
