<template>
  <v-hover v-slot="{ hover }">
    <v-select
      :id="control.id + '-input'"
      :class="styles.control.input"
      :disabled="!control.enabled"
      :autofocus="appliedOptions.focus"
      :placeholder="appliedOptions.placeholder"
      :label="computedLabel"
      :hint="control.description"
      :persistent-hint="persistentHint()"
      :required="control.required"
      :error-messages="control.errors"
      :clearable="hover"
      :value="control.data"
      :items="control.options"
      item-text="label"
      item-value="value"
      @change="onChange"
      outlined
      dense
    />
  </v-hover>
</template>

<script lang="ts">
import {
  ControlElement,
  JsonFormsRendererRegistryEntry,
  rankWith,
  isOneOfEnumControl,
} from '@jsonforms/core';
import { defineComponent } from "@vue/composition-api"
import {
  rendererProps,
  useJsonFormsOneOfEnumControl,
  RendererProps,
} from '@jsonforms/vue2';
import { default as ControlWrapper } from './ControlWrapper.vue';
import { useVuetifyControl } from '@jsonforms/vue2-vuetify'
import { VSelect, VHover } from 'vuetify/lib';

const controlRenderer = defineComponent({
  name: 'oneof-enum-control-renderer',
  components: {
    ControlWrapper,
    VSelect,
    VHover,
  },
  directives: {
  },
  props: {
    ...rendererProps<ControlElement>(),
  },
  setup(props: RendererProps<ControlElement>) {
    return useVuetifyControl(
      useJsonFormsOneOfEnumControl(props),
      (value) => value || undefined
    );
  },
  created() {
    if (!this.control.data && this.control.schema.default) {
      this.handleChange(this.control.path, this.control.schema.default)
    }
  }
});

export default controlRenderer;

export const oneOfEnumControlRenderer: JsonFormsRendererRegistryEntry = {
  renderer: controlRenderer,
  tester: rankWith(5, isOneOfEnumControl),
};
</script>