/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Simulate authenticated state by seeding the vuex-persistedstate
       * localStorage entry that the app reads on boot.
       * Bypasses the ORCID OAuth popup entirely.
       */
      login(): Chainable<void>
    }
  }
}

Cypress.Commands.add('login', () => {
  // vuex-persistedstate stores the Vuex tree under the key "CZ Hub".
  // The hasLoggedInGuard reads User.$state.isLoggedIn, which maps to
  // state.entities.users.isLoggedIn. We seed the minimum fields the
  // guards and app need to treat the session as authenticated.
  const vuexState = {
    entities: {
      users: {
        isLoggedIn: true,
        orcid: '0000-0000-0000-0000',
        orcidAccessToken: 'fake-cypress-token',
        next: '',
        hasUnsavedChanges: false,
        isSaving: false,
        registeringSubmission: null,
        showSubmissionWarning: true,
      },
    },
  }

  localStorage.setItem('CZ Hub', JSON.stringify(vuexState))
})
