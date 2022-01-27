<template>
  <v-textarea
    :id="control.id + '-input'"
    :class="styles.control.textarea"
    :value="control.data"
    :disabled="!control.enabled"
    :autofocus="appliedOptions.focus"
    :placeholder="appliedOptions.placeholder"
    :label="computedLabel"
    @change.native="onChanges"
  />
</template>

<script lang="ts">
import {
  ControlElement,
  JsonFormsRendererRegistryEntry,
  rankWith,
  isStringControl,
  isMultiLineControl,
  and
} from '@jsonforms/core';
import { defineComponent } from '@vue/composition-api'
import { rendererProps, useJsonFormsControl, RendererProps } from '@jsonforms/vue2';
// import { default as ControlWrapper } from './ControlWrapper.vue';
import { useVanillaControl } from "@jsonforms/vue2-vanilla";
import { computeLabel } from '@jsonforms/core';

const controlRenderer = defineComponent({
  name: 'multi-string-control-renderer',
  components: {
    // ControlWrapper
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

export const multiStringControlRenderer: JsonFormsRendererRegistryEntry = {
  renderer: controlRenderer,
  tester: rankWith(3, and(isStringControl, isMultiLineControl))
};
</script>
