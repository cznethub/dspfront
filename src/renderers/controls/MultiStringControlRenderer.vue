<template>
  <v-textarea
    :id="control.id + '-input'"
    :data-id="computedLabel.replaceAll(` `, ``)"
    @input.native="beforeChange"
    :maxlength="appliedOptions.restrict ? control.schema.maxLength : undefined"
    :counter="control.schema.maxLength !== undefined
            ? control.schema.maxLength
            : undefined
        "
    :error-messages="control.errors"
    :required="control.required"
    :class="styles.control.textarea"
    :hint="description"
    :value="control.data"
    :disabled="!control.enabled"
    :autofocus="appliedOptions.focus"
    :placeholder="placeholder"
    :label="computedLabel"
    persistent-hint
    outlined
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
  </v-textarea>
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
import { defineComponent } from 'vue'
import { rendererProps, useJsonFormsControl, RendererProps } from '@jsonforms/vue2';
import { useVuetifyControl } from '@/renderers/util/composition';

const controlRenderer = defineComponent({
  name: 'multi-string-control-renderer',
  components: {
    // ControlWrapper
  },
  props: {
    ...rendererProps<ControlElement>()
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

    // If no value loaded but there is a default, populate it
    if (!this.control.data && this.control.schema.default) {
      this.control.data = this.control.schema.default
      this.handleChange(this.control.path, this.control.data)
    }

    // If a value was loaded, check if HTML needs to be stripped
    if (this.control.data && this.stripHTML) {
      this.handleChange(this.control.path, this.strip(this.control.data))
    }
  },
  computed: {
    placeholder(): string {
      // @ts-ignore
      return this.control.schema.options?.placeholder || this.appliedOptions.placeholder || ''
    },
    description(): string {
      return this.control.description || this.appliedOptions.description || ''
    },
    cleanedErrors() {
      // @ts-ignore
      return this.control.errors.replaceAll(`is a required property`, ``)
    },
    stripHTML(): string {
      // @ts-ignore
      return !!this.control.schema.options?.stripHTML
    }
  },
  methods: {
    // If value changed to an empty string, we need to set the data to undefined in order to trigger validation error
    beforeChange(event) {
      if (event.target.value.trim() === '') {
        this.handleChange(this.control.path, undefined)
      }
      else {
        this.onChange(event.target.value)
      }
    },
    strip(html: string) {
      const doc = new DOMParser().parseFromString(html, 'text/html')
      return doc.body.textContent || ''
    }
  }
})

export default controlRenderer;

export const multiStringControlRenderer: JsonFormsRendererRegistryEntry = {
  renderer: controlRenderer,
  tester: rankWith(4, and(isStringControl, isMultiLineControl))
};
</script>
