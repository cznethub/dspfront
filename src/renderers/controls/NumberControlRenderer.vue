<template>
  <v-text-field
    type="number"
    :label="computedLabel"
    :step="step"
    :id="control.id + '-input'"
    :data-id="computedLabel.replaceAll(` `, ``)"
    :class="styles.control.input"
    :value="control.data"
    :disabled="!control.enabled"
    :autofocus="appliedOptions.focus"
    :placeholder="appliedOptions.placeholder"
    :hint="control.description"
    :max="control.schema.exclusiveMaximum"
    :min="control.schema.exclusiveMinumum"
    :error-messages="control.errors"
    @change.native="beforeChange"
    class="py-3"
    persistent-hint
    dense
    outlined
  >
    <template v-slot:message>
      <div v-if="control.schema.description" class="text-subtitle-1 text--secondary">
        {{ control.schema.description }}
      </div>
      <div v-if="cleanedErrors" class="ml-2 v-messages error--text" :class="styles.control.error">
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
  isNumberControl
} from '@jsonforms/core';
import { defineComponent } from '@vue/composition-api'
import { rendererProps, useJsonFormsControl, RendererProps } from '@jsonforms/vue2'
import { default as ControlWrapper } from './ControlWrapper.vue'
import { useVanillaControl } from "@jsonforms/vue2-vanilla"
import { computeLabel } from '@jsonforms/core'

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
    )
  },
  created() {
    // console.log(this.control)
    // If the value that was loaded is null, turn it into undefined
    if (this.control.data === null) {
      this.handleChange(this.control.path, undefined)
    }
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
    },
    cleanedErrors() {
      // @ts-ignore
      return this.control.errors.replaceAll(`is a required property`, ``)
    }
  },
  methods: {
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

export const numberControlRenderer: JsonFormsRendererRegistryEntry = {
  renderer: controlRenderer,
  tester: rankWith(2, isNumberControl)
}
</script>

<style lang="scss" scoped>
.v-text-field {
  max-width: 20rem;
}
</style>