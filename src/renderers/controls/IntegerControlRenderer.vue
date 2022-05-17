<template>
  <v-text-field
    outlined
    type="number"
    :step="step"
    :id="control.id + '-input'"
    :class="styles.control.input"
    :disabled="!control.enabled"
    :autofocus="appliedOptions.focus"
    :placeholder="appliedOptions.placeholder"
    :label="computedLabel"
    :hint="control.description"
    :persistent-hint="persistentHint()"
    :required="control.required"
    :error-messages="control.errors"
    :value="control.data"
    @change.native="beforeChange($event)"
  />
</template>

<script lang="ts">
import {
  ControlElement,
  JsonFormsRendererRegistryEntry,
  rankWith,
  isIntegerControl,
} from '@jsonforms/core';
import { defineComponent } from '@vue/composition-api'
import {
  rendererProps,
  useJsonFormsControl,
  RendererProps,
} from '@jsonforms/vue2';
import { default as ControlWrapper } from './ControlWrapper.vue';
import { useVuetifyControl } from '@jsonforms/vue2-vuetify'
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
      (value) => parseInt(value, 10) || undefined
    );
  },
  computed: {
    step(): number {
      const options: any = this.appliedOptions;
      return options.step ?? 1;
    },
  },
  methods: {
    // If value changed to an empty string, we need to set the data to undefined in order to trigger validation error
    beforeChange(event) {
      if (event.target.value === null || event.target.value.trim() === '') {
        this.handleChange(this.control.path, undefined)
      }
      else {
        this.onChange(event)
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