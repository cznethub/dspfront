<template>
  <v-text-field
    outlined
    type="number"
    @change.native="beforeChange($event)"
    :step="step"
    :id="control.id + '-input'"
    :class="styles.control.input"
    :disabled="!control.enabled"
    :autofocus="appliedOptions.focus"
    :placeholder="placeholder"
    :label="computedLabel"
    :hint="description"
    :required="control.required"
    :error-messages="control.errors"
    :value="control.data"
    persistent-hint
    dense
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
  </v-text-field>
</template>

<script lang="ts">
import {
  ControlElement,
  JsonFormsRendererRegistryEntry,
  rankWith,
  isIntegerControl,
} from '@jsonforms/core';
import { defineComponent } from 'vue'
import {
  rendererProps,
  useJsonFormsControl,
  RendererProps,
} from '@jsonforms/vue2';
import { default as ControlWrapper } from './ControlWrapper.vue';
import { useVuetifyControl } from '@/renderers/util/composition';
import { VTextField } from 'vuetify/lib';

const controlRenderer = defineComponent({
  name: 'integer-control-renderer',
  components: {
    ControlWrapper,
    VTextField,
  },
  props: {
    ...rendererProps<ControlElement>(),
  },
  setup(props: RendererProps<ControlElement>) {
    return useVuetifyControl(
      useJsonFormsControl(props),
      (value) => {
        const val = parseInt(value, 10)
        return isNaN(val) ? undefined : val
      }
    );
  },
  computed: {
    step(): number {
      const options: any = this.appliedOptions;
      return options.step ?? 1;
    },
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
  methods: {
    // If value changed to an empty string, we need to set the data to undefined in order to trigger validation error
    beforeChange(event) {
      if (event.target.value === null || event.target.value.trim() === '') {
        this.handleChange(this.control.path, undefined)
      }
      else {
        this.onChange(event.target.value)
      }
    }
  }
});

export default controlRenderer;

export const integerControlRenderer: JsonFormsRendererRegistryEntry = {
  renderer: controlRenderer,
  tester: rankWith(2, isIntegerControl),
};
</script>