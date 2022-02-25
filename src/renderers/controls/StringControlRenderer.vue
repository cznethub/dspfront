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
    :error-messages="control.errors"
    :required="control.required"
    :maxlength="appliedOptions.restrict ? control.schema.maxLength : undefined"
    :counter="control.schema.maxLength !== undefined
            ? control.schema.maxLength
            : undefined
        "
    @change.native="onChange"
    class="my-2"
    dense
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
import { rendererProps, useJsonFormsControl, RendererProps } from '@jsonforms/vue2'
import { useVanillaControl } from "@jsonforms/vue2-vanilla"
import { computeLabel } from '@jsonforms/core'

const controlRenderer = defineComponent({
  name: 'string-control-renderer',
  props: {
    ...rendererProps<ControlElement>()
  },
  setup(props: RendererProps<ControlElement>) {
    return useVanillaControl(useJsonFormsControl(props))
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
})

export default controlRenderer

export const stringControlRenderer: JsonFormsRendererRegistryEntry = {
  renderer: controlRenderer,
  tester: rankWith(2, isStringControl)
}
</script>

<style lang="scss" scoped>
  
</style>