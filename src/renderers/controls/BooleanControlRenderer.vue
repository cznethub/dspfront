<template>
  <v-checkbox
    :id="control.id + '-input'"
    :class="styles.control.input"
    :disabled="!control.enabled"
    :autofocus="appliedOptions.focus"
    :placeholder="placeholder"
    :label="computedLabel"
    :hint="description"
    persistent-hint
    :required="control.required"
    :error-messages="control.errors"
    :indeterminate="control.data === undefined"
    :input-value="control.data"
    :value="control.data"
    v-bind="vuetifyProps('v-checkbox')"
    @change="onChange"
    @focus="isFocused = true"
    @blur="isFocused = false"
    class="py-3"
  >
    <template v-slot:message>
      <div v-if="description" class="text-subtitle-1 text--secondary">
        {{ description }}
      </div>
      <div v-if="cleanedErrors" class="ml-2 v-messages error--text">
        {{ cleanedErrors }}
      </div>
    </template>
  </v-checkbox>
</template>

<script lang="ts">
import {
  ControlElement,
  JsonFormsRendererRegistryEntry,
  rankWith,
  isBooleanControl,
} from '@jsonforms/core';
import { defineComponent } from 'vue'
import {
  rendererProps,
  useJsonFormsControl,
  RendererProps,
} from '@jsonforms/vue2';
import { default as ControlWrapper } from './ControlWrapper.vue';
import { useVuetifyControl } from '@/renderers/util/composition';
import { VCheckbox } from 'vuetify/lib';

const controlRenderer = defineComponent({
  name: 'boolean-control-renderer',
  components: {
    VCheckbox,
    ControlWrapper,
  },
  props: {
    ...rendererProps<ControlElement>(),
  },
  setup(props: RendererProps<ControlElement>) {
    return useVuetifyControl(
      useJsonFormsControl(props),
      (newValue) => newValue || false
    );
  },
  created() {
    if (!this.control.data && this.control.schema.default !== undefined) {
      this.control.data = this.control.schema.default
      this.handleChange(this.control.path, this.control.data)
    }
  },
  computed: {
    cleanedErrors() {
      // @ts-ignore
      return this.control.errors.replaceAll(`is a required property`, ``)
    },
    placeholder(): string {
      // @ts-ignore
      return this.control.schema.options?.placeholder || this.appliedOptions.placeholder || ''
    },
    description(): string {
      return this.control.description || this.appliedOptions.description || ''
    },
  },
});

export default controlRenderer;

export const booleanControlRenderer: JsonFormsRendererRegistryEntry = {
  renderer: controlRenderer,
  tester: rankWith(1, isBooleanControl),
};
</script>