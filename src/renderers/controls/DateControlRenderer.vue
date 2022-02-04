<template>
  <!-- <control-wrapper
    v-bind="controlWrapper"
    :styles="styles"
    :isFocused="isFocused"
    :appliedOptions="appliedOptions"
  >
    <input
      type="date"
      :id="control.id + '-input'"
      :class="styles.control.input"
      :value="control.data"
      :disabled="!control.enabled"
      :autofocus="appliedOptions.focus"
      :placeholder="appliedOptions.placeholder"
      :hint="control.description"
      @change="onChange"
      @focus="isFocused = true"
      @blur="isFocused = false"
    />
  </control-wrapper> -->

  <v-menu
    v-model="menu"
    :close-on-content-click="false"
    :nudge-right="40"
    offset-y
    min-width="auto"
  >
    <template v-slot:activator="{ on, attrs }">
      <v-text-field
        v-model="selectedDate"
        :id="control.id + '-input'"
        :label="control.label"
        @click:clear="selectedDate = null"
        :autofocus="appliedOptions.focus"
        :class="styles.control.input"
        :hint="control.description"
        :error-messages="control.errors"
        prepend-icon="mdi-calendar"
        style="max-width: 15rem;"
        outlined
        readonly
        clearable
        v-bind="attrs"
        dense
        v-on="on"
      />
    </template>

    <v-date-picker v-model="selectedDate"
      @change="onChange" 
      @input="menu = false"
      :value="control.data" 
      :disabled="!control.enabled"
      scrollable 
      no-title
    />
  </v-menu>
</template>


<script lang="ts">
import {
  ControlElement,
  JsonFormsRendererRegistryEntry,
  rankWith,
  isDateControl
} from '@jsonforms/core';
import { defineComponent } from '@vue/composition-api'
import { rendererProps, useJsonFormsControl, RendererProps } from '@jsonforms/vue2';
import { useVanillaControl } from "@jsonforms/vue2-vanilla";
const controlRenderer = defineComponent({
  name: 'date-control-renderer',
  components: {
    // ControlWrapper
  },
  props: {
    ...rendererProps<ControlElement>()
  },
  setup(props: RendererProps<ControlElement>) {
    let selectedDate = null

    return {
      selectedDate,
      menu: false,
      ...useVanillaControl(useJsonFormsControl(props))
    }
  },
});

export default controlRenderer;

export const dateControlRenderer: JsonFormsRendererRegistryEntry = {
  renderer: controlRenderer,
  tester: rankWith(3, isDateControl)
};
</script>
