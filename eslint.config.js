// @ts-check
import antfu from '@antfu/eslint-config'

export default antfu(
  {
    formatters: true,
    overrides: {
      vue: {
        'vue/block-order': ['error', {
          order: ['template', 'script', 'style'],
        }],
      },
    },
  },
)
