<template>
  <validation-badge v-if="errors && errors.length > 0" :errors="errors">
    <v-icon color="error">mdi-alert-circle-outline</v-icon>
  </validation-badge>
</template>

<script lang="ts">
import { defineComponent } from "@vue/composition-api"
import { ErrorObject } from 'ajv';
import { default as ValidationBadge } from './ValidationBadge.vue';
import { VIcon } from 'vuetify/lib';
import { CompType } from '@jsonforms/vue2-vuetify/lib/vue'

export default defineComponent({
  name: 'validation-icon',
  components: {
    ValidationBadge,
    VIcon,
  },
  props: {
    errors: {
      required: true,
      type: Array as CompType<ErrorObject, ArrayConstructor>,
    },
  },
});
</script>