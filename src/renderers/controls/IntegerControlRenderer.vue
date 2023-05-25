<template>
  <v-text-field
    :id="control.id + '-input'"
    variant="outlined"
    type="number"
    :step="step"
    :class="styles.control.input"
    :disabled="!control.enabled"
    :autofocus="appliedOptions.focus"
    :placeholder="placeholder"
    :label="computedLabel"
    :hint="description"
    :required="control.required"
    :error-messages="control.errors"
    :model-value="control.data"
    persistent-hint
    density="compact"
    class="py-3"
    @change.native="beforeChange($event)"
  >
    <template #message>
      <div v-if="description" class="text-subtitle-1 text--secondary">
        {{ description }}
      </div>
      <div v-if="cleanedErrors" class="ml-2 v-messages text-error">
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
} from '@jsonforms/vue';
import { default as ControlWrapper } from './ControlWrapper.vue';
import { useVuetifyControl } from '@/renderers/util/composition';
import { VTextField } from 'vuetify/components';

const controlRenderer = defineComponent({
  name: 'IntegerControlRenderer',
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