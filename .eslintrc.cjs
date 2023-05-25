/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution')

module.exports = {
  root: true,
  'extends': [
    'plugin:vue/vue3-essential',
    'plugin:vue/vue3-recommended',
    'eslint:recommended',
    '@vue/eslint-config-typescript',
    '@vue/eslint-config-prettier/skip-formatting',
    'plugin:vuetify/base',
    'prettier'
  ],
  overrides: [
    {
      files: [
        '**/__tests__/*.{cy,spec}.{js,ts,jsx,tsx}',
        'cypress/e2e/**/*.{cy,spec}.{js,ts,jsx,tsx}'
      ],
      'extends': [
        'plugin:cypress/recommended'
      ]
    }
  ],
  parserOptions: {
    ecmaVersion: 'latest'
  },
  rules: {
    // TODO: drc fix all of these linting errors
    // https://vuetifyjs.com/en/getting-started/upgrade-guide/
    // https://github.com/eclipsesource/jsonforms-vuetify-renderers/tree/vue3
    // https://github.com/eclipsesource/jsonforms-vuetify-renderers/commit/a4f3a119e658beaa70e15517f7fb92f57060309a
    "@typescript-eslint/no-unused-vars": ["off"],
    "vue/no-unused-components": ["off"],
    "no-prototype-builtins": ["off"],
    "vue/no-deprecated-router-link-tag-prop": ["off"],
    "vuetify/no-deprecated-props": ["off"],
    "vue/no-deprecated-v-on-native-modifier": ["off"],
    "vue/return-in-computed-property": ["off"],
    "vue/no-lone-template":["off"],
    "vue/no-deprecated-filter": ["off"],
    "no-irregular-whitespace": ["off"]
  }
}
