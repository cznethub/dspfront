<template>
  <!-- <control-wrapper
    v-bind="controlWrapper"
    :styles="styles"
    :isFocused="isFocused"
    :appliedOptions="appliedOptions"
  > -->
    <v-text-field
      type="number"
      :label="computedLabel"
      :step="step"
      :id="control.id + '-input'"
      :class="styles.control.input"
      :value="control.data"
      :disabled="!control.enabled"
      :autofocus="appliedOptions.focus"
      :placeholder="appliedOptions.placeholder"
      @change="onChange"
      @focus="isFocused = true"
      @blur="isFocused = false"
      outlined
    />
  <!-- </control-wrapper> -->
</template>

<script lang="ts">
import {
  ControlElement,
  JsonFormsRendererRegistryEntry,
  rankWith,
  isNumberControl
} from '@jsonforms/core';
import { defineComponent } from '@vue/composition-api'
import { rendererProps, useJsonFormsControl, RendererProps } from '@jsonforms/vue2';
import { default as ControlWrapper } from './ControlWrapper.vue';
import { useVanillaControl } from "@jsonforms/vue2-vanilla";
import { computeLabel } from '@jsonforms/core';

const controlRenderer = defineComponent({
  name: 'number-control-renderer',
  components: {
    ControlWrapper
  },
  props: {
    ...rendererProps<ControlElement>(),
  },
  setup(props: RendererProps<ControlElement>) {
    return useVanillaControl(useJsonFormsControl(props), target =>
      Number(target.value)
    );
  },
  computed: {
    step(): number {
      const options: any = this.appliedOptions;
      return options.step ?? 0.1;
    },
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

export const numberControlRenderer: JsonFormsRendererRegistryEntry = {
  renderer: controlRenderer,
  tester: rankWith(2, isNumberControl)
};
</script>
