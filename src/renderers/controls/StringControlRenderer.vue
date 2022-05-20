

<template>
  <v-combobox
    v-if="suggestions !== undefined"
    :id="control.id + '-input'"
    :class="styles.control.input"
    :disabled="!control.enabled"
    :autofocus="appliedOptions.focus"
    :placeholder="placeholder"
    :label="computedLabel"
    :hint="control.description"
    :persistent-hint="persistentHint()"
    :required="control.required"
    :error-messages="control.errors"
    :maxlength="
      appliedOptions.restrict ? control.schema.maxLength : undefined
    "
    :counter="
      control.schema.maxLength !== undefined
        ? control.schema.maxLength
        : undefined
    "
    :value="control.data"
    :items="suggestions"
    hide-no-data
    v-bind="vuetifyProps('v-combobox')"
    @input="beforeChange"
    dense
    outlined
    class="py-2"
  />
  <v-text-field
    v-else
    :id="control.id + '-input'"
    :class="styles.control.input"
    :disabled="!control.enabled"
    :autofocus="appliedOptions.focus"
    :placeholder="placeholder"
    :label="computedLabel"
    :hint="control.description"
    :persistent-hint="persistentHint()"
    :required="control.required"
    :error-messages="control.errors"
    :value="control.data"
    :maxlength="
      appliedOptions.restrict ? control.schema.maxLength : undefined
    "
    :counter="
      control.schema.maxLength !== undefined
        ? control.schema.maxLength
        : undefined
    "
    v-bind="vuetifyProps('v-text-field')"
    @input="beforeChange"
    :hide-details="'auto'"
    class="py-2"
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
import { useVuetifyControl } from '@jsonforms/vue2-vuetify'
import isArray from 'lodash/isArray';
import every from 'lodash/every';
import isString from 'lodash/isString';

const controlRenderer = defineComponent({
  name: 'string-control-renderer',
  props: {
    ...rendererProps<ControlElement>(),
  },
  setup(props: RendererProps<ControlElement>) {
    return useVuetifyControl(
      useJsonFormsControl(props),
      (value) => value || undefined,
      300
    );
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
    suggestions(): string[] | undefined {
      const suggestions = this.control.uischema.options?.suggestions;
      if (
        suggestions === undefined ||
        !isArray(suggestions) ||
        !every(suggestions, isString)
      ) {
        // check for incorrect data
        return undefined;
      }
      return suggestions;
    },
    placeholder(): string {
      // @ts-ignore
      return this.control.schema.options?.placeholder || ''
    },
  },
  methods: {
    // If value changed to an empty string, we need to set the data to undefined in order to trigger validation error
    beforeChange(input: string) {
      if (!input?.trim()) {
        this.handleChange(this.control.path, undefined)
      }
      else {
        this.onChange(input)
      }
    }
  }
});

export default controlRenderer

export const stringControlRenderer: JsonFormsRendererRegistryEntry = {
  renderer: controlRenderer,
  tester: rankWith(2, isStringControl)
}
</script>

<style lang="scss" scoped>
  
</style>