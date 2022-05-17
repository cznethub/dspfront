<template>
  <v-text-field
    v-if="!isHidden"
    :id="control.id + '-input'"
    :class="styles.control.input"
    :data-id="computedLabel.replaceAll(` `, ``)"
    :value="control.data"
    :disabled="!control.enabled || control.schema.readOnly"
    :autofocus="appliedOptions.focus"
    :label="computedLabel"
    :hint="control.description"
    :placeholder="placeholder || appliedOptions.placeholder"
    :error-messages="control.errors"
    :required="control.required"
    :maxlength="appliedOptions.restrict ? control.schema.maxLength : undefined"
    :counter="control.schema.maxLength !== undefined ? control.schema.maxLength : undefined"
    :readonly="control.schema.readOnly"
    @change.native="beforeChange($event)"
    class="my-4"
    persistent-hint
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
} from '@jsonforms/core'
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
  created() {
    // If the value that was loaded is null, turn it into undefined
    if (this.control.data === null) {
      this.handleChange(this.control.path, undefined)
    }

    if (!this.control.data && this.control.schema.default) {
      this.control.data = this.control.schema.default
      this.handleChange(this.control.path, this.control.data)
    }
  },
  computed: {
    computedLabel(): string {
      return computeLabel(
        this.control.label as string,
        this.control.required,
        !!this.appliedOptions?.hideRequiredAsterisk
      )
    },
    placeholder(): string {
      // @ts-ignore
      return this.control.schema.options?.placeholder || ''
    },
    isHidden(): boolean {
      // @ts-ignore
      return this.control.schema.options && this.control.schema.options.hidden
    }
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
})

export default controlRenderer

export const stringControlRenderer: JsonFormsRendererRegistryEntry = {
  renderer: controlRenderer,
  tester: rankWith(2, isStringControl)
}
</script>

<style lang="scss" scoped>
  
</style>