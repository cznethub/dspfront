<template>
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
        :label="control.label"
        @click:clear="selectedDate = null"
        :hint="control.description"
        :error-messages="control.errors"
        prepend-icon="mdi-calendar"
        outlined
        readonly
        clearable
        v-bind="attrs"
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
  isDateTimeControl,
  JsonFormsRendererRegistryEntry,
  rankWith,
} from "@jsonforms/core";
import { defineComponent } from "@vue/composition-api";
import { rendererProps, useJsonFormsControl } from "@jsonforms/vue2";
import format from "date-fns/format";

// https://stackoverflow.com/questions/40369287/what-pattern-should-be-used-to-parse-rfc-3339-datetime-strings-in-java
// TODO: add the rest of date formats used by jsonschema
const dateFormats = {
  "date-time": "yyyy-MM-dd'T'HH:mm:ssXXX",
};

// https://www.npmjs.com/package/@jsonforms/vue2

const controlRenderer = defineComponent({
  name: "control-renderer",
  props: {
    ...rendererProps(),
  },
  setup(props: any) {
    let selectedDate = null

    return {
      selectedDate,
      menu: false,
      ...useJsonFormsControl(props),
    };
  },
  created() {
  },
  methods: {
    onChange(value: string) {
      const selectedDate = new Date(value)
      const schemaDateFormat = this.control.schema.format || "date-time"
      const formattedValue = format(selectedDate, dateFormats[schemaDateFormat])
      this.handleChange(this.control.path, formattedValue);
    },
  },
});
export default controlRenderer;

export const inputDateRenderer: JsonFormsRendererRegistryEntry = {
  renderer: controlRenderer,
  tester: rankWith(3, isDateTimeControl),
};
</script>

<style lang="scss" scoped>
</style>


