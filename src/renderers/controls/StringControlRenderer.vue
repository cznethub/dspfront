<template>
  <v-text-field
    :id="control.id + '-input'"
    :class="styles.control.input"
    :value="control.data"
    :disabled="!control.enabled"
    :autofocus="appliedOptions.focus"
    :label="computedLabel"
    :hint="control.description"
    :placeholder="appliedOptions.placeholder"
    @change.native="onChange"
    outlined
  />
</template>

<script lang="ts">
import {
  ControlElement,
  JsonFormsRendererRegistryEntry,
  rankWith,
  isStringControl
} from '@jsonforms/core';
import { defineComponent } from '@vue/composition-api'
import { rendererProps, useJsonFormsControl, RendererProps } from '@jsonforms/vue2';
import { default as ControlWrapper } from './ControlWrapper.vue';
import { useVanillaControl } from "@jsonforms/vue2-vanilla";
import { computeLabel } from '@jsonforms/core';

const controlRenderer = defineComponent({
  name: 'string-control-renderer',
  components: {
    ControlWrapper
  },
  props: {
    ...rendererProps<ControlElement>()
  },
  setup(props: RendererProps<ControlElement>) {
    return useVanillaControl(useJsonFormsControl(props));
  },
  computed: {
    computedLabel(): string {
      return computeLabel(
        this.control.label as string,
        this.control.required,
        !!this.appliedOptions?.hideRequiredAsterisk
      );
    }
  }
});

export default controlRenderer;

export const stringControlRenderer: JsonFormsRendererRegistryEntry = {
  renderer: controlRenderer,
  tester: rankWith(2, isStringControl)
};
</script>
