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
        @click:clear="selectedDate = null"
        @change="onInput($event)"
        :disabled="!control.enabled"
        :hidden="control.hidden"
        :value="dataDate"
        :id="control.id + '-input'"
        :label="control.label"
        :hint="control.description"
        :error-messages="control.errors"
        prepend-icon="mdi-calendar"
        persistent-hint
        class="my-2"
        style="max-width: 15rem;"
        outlined
        readonly
        clearable
        v-bind="attrs"
        dense
        v-on="on"
      />
    </template>

    <v-date-picker
      v-model="selectedDate"
      @change="onInput($event)" 
      @input="menu = false"
      :value="control.data" 
      :disabled="!control.enabled"
      scrollable 
    />
  </v-menu>
</template>

<script lang="ts">
import {
  ControlElement,
  JsonFormsRendererRegistryEntry,
  rankWith,
  isDateControl
} from '@jsonforms/core'
import { defineComponent } from '@vue/composition-api'
import { rendererProps, useJsonFormsControl, RendererProps } from '@jsonforms/vue2'
import { format, parse } from 'date-fns'
import { computeLabel } from '@jsonforms/core'
import { useVanillaControl } from "@jsonforms/vue2-vanilla"

const DEFAULT_DATE_FORMAT = 'yyyy-MM-dd'

const DATE_FORMATS = {
  "date": "yyyy-MM-dd",
}

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
  created() {
    console.log(this.control)
  },
  computed: {
    dataDate(): string {
      return (this.control.data ?? '')
    },
    parsedDate() {
      if (this.selectedDate) {
        // @ts-ignore
        return parse(this.selectedDate, this.defaultDateFormat, new Date())
      } else {
        return null
      }
    },
    defaultDateFormat() {
      return DEFAULT_DATE_FORMAT
    },
    formattedDate() {
      // @ts-ignore
      return this.parsedDate ? format(this.parsedDate, DATE_FORMATS[this.dateFormat]) : ''
    },
    dateFormat() {
      // @ts-ignore
      return this.control.schema.format || "date"
    },
    computedLabel(): string {
      return computeLabel(
        this.control.label as string,
        this.control.required,
        !!this.appliedOptions?.hideRequiredAsterisk
      );
    }
  },
  methods: {
    onInput() {
      this.handleChange(this.control.path, this.formattedDate)
    },
  },
})

export default controlRenderer

export const dateControlRenderer: JsonFormsRendererRegistryEntry = {
  renderer: controlRenderer,
  tester: rankWith(3, isDateControl)
}
</script>
