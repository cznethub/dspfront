<template>
  <v-textarea
    :id="control.id + '-input'"
    :data-id="computedLabel.replaceAll(` `, ``)"
    @change.native="beforeChange"
    :maxlength="appliedOptions.restrict ? control.schema.maxLength : undefined"
    :counter="control.schema.maxLength !== undefined
            ? control.schema.maxLength
            : undefined
        "
    :error-messages="control.errors"
    :required="control.required"
    :class="styles.control.textarea"
    :hint="control.description"
    :value="control.data"
    :disabled="!control.enabled"
    :autofocus="appliedOptions.focus"
    :placeholder="appliedOptions.placeholder"
    :label="computedLabel"
    persistent-hint
    outlined
    dense
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
  created() {
    // If the value that was loaded is null, turn it into undefined
    if (this.control.data === null) {
      this.handleChange(this.control.path, undefined)
    }

    if (!this.control.data && this.control.schema.default) {
      this.control.data = this.control.schema.default
      this.handleChange(this.control.path, this.control.data)
    }
    
    // If the value that was loaded is null, turn it into undefined
    if (this.control.data === null) {
      this.handleChange(this.control.path, undefined)
    }
  },
  computed: {
    computedLabel(): string {
      return computeLabel(
        this.control.label as string,
        this.control.required,
        !!this.appliedOptions?.hideRequiredAsterisk
      );
    }
  },
  methods: {
    // If value changed to an empty string, we need to set the data to undefined in order to trigger validation error
    beforeChange(event) {
      if (event.target.value.trim() === '') {
        this.handleChange(this.control.path, undefined)
      }
      else {
        this.onChange(event)
      }
    }
  }
})

export default controlRenderer;

export const multiStringControlRenderer: JsonFormsRendererRegistryEntry = {
  renderer: controlRenderer,
  tester: rankWith(4, and(isStringControl, isMultiLineControl))
};
</script>
