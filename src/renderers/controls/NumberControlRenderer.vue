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
    :hint="description"
    :max="control.schema.exclusiveMaximum"
    :min="control.schema.exclusiveMinumum"
    :error-messages="control.errors"
    @input="onInputChange"
    class="py-3"
    persistent-hint
    dense
    outlined
  >
    <template v-slot:message>
      <div v-if="description" class="text-subtitle-1 text--secondary">
        {{ description }}
      </div>
      <div v-if="cleanedErrors" class="ml-2 v-messages error--text">
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
import { defineComponent, ref, unref } from 'vue'
import { rendererProps, useJsonFormsControl, RendererProps } from '@jsonforms/vue2'
import { default as ControlWrapper } from './ControlWrapper.vue';
import { useVuetifyControl } from '@/renderers/util/composition';

const NUMBER_REGEX_TEST = /^[+-]?\d+([.]\d+)?([eE][+-]?\d+)?$/;

const controlRenderer = defineComponent({
  name: 'number-control-renderer',
  components: {
    ControlWrapper
  },
  props: {
    ...rendererProps<ControlElement>(),
  },
  setup(props: RendererProps<ControlElement>) {
    const adaptValue = (value: any) =>
      typeof value === 'number' ? value : value || undefined;
    const input = useVuetifyControl(useJsonFormsControl(props), adaptValue);

    // preserve the value as it was typed by the user - for example when the user type very long number if we rely on the control.data to return back the actual data then the string could appear with exponent form and etc.
    // otherwise while typing the string in the input can suddenly change
    const inputValue = ref((unref(input.control).data as string) || '');
    return { ...input, adaptValue, inputValue };
  },
  created() {
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
    cleanedErrors() {
      // @ts-ignore
      return this.control.errors.replaceAll(`is a required property`, ``)
    },
    description(): string {
      return this.control.description || this.appliedOptions.description || ''
    },
  },
  methods: {
    // beforeChange(event) {
    //   if (event.target.value.trim() === '') {
    //     this.handleChange(this.control.path, undefined)
    //   }
    //   else {
    //     this.onChange(event)
    //   }
    // },
    onInputChange(value: string): void {
      this.inputValue = value;
      const result = this.toNumberOrString(value);
      if (typeof result === 'number') {
        // if user entered 5675.4444444444444444444444444444444 but the actual data is 5675.444444444444 then sync the input with what the data represents and try to preserve the format
        const inputStringIsInExponentForm =
          this.inputValue.includes('E') || this.inputValue.includes('e');

        const numberAsString = inputStringIsInExponentForm
          ? result.toExponential()
          : result.toPrecision();

        const numberIsInExponentForm =
          numberAsString.includes('E') || numberAsString.includes('e');

        if (
          this.inputValue !== numberAsString &&
          inputStringIsInExponentForm === numberIsInExponentForm // only change the input if both the user input and the string representation of the number are in the same form
        ) {
          this.$nextTick(() => (this.inputValue = numberAsString));
        }
      }
      this.onChange(result);
    },
    toNumberOrString(value: string): number | string {
      // have a regex test before parseFloat to make sure that invalid input won't be ignored and will lead to errors, parseFloat will parse invalid input such 7.22m6 as 7.22
      if (NUMBER_REGEX_TEST.test(value)) {
        const num = Number.parseFloat(value);
        if (Number.isFinite(num)) {
          // return the parsed number only if it is not NaN or Infinite
          return num;
        }
      }
      return value;
    },
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