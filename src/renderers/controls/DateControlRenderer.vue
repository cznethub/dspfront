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
        @click:clear="onClear"
        @change="onInput($event)"
        :disabled="!control.enabled"
        :hidden="control.hidden"
        :value="dataDate"
        :id="control.id + '-input'"
        :data-id="computedLabel.replaceAll(` `, ``)"
        :label="computedLabel"
        :hint="control.description"
        :error-messages="control.errors"
        :required="control.required"
        :placeholder="placeholder"
        prepend-icon="mdi-calendar"
        persistent-hint
        class="py-3"
        outlined
        clearable
        v-bind="attrs"
        dense
        v-on="on"
      >
        <template v-slot:message>
          <div v-if="control.schema.description" class="text-subtitle-1 text--secondary">
            {{ control.schema.description }}
          </div>
          <div v-if="cleanedErrors" class="ml-2 v-messages error--text">
            {{ cleanedErrors }}
          </div>
        </template>
      </v-text-field>
    </template>

    <v-date-picker
      v-model="selectedDate"
      @change="onInput($event)" 
      @input="menu = false"
      :max="maxDate"
      :min="minDate"
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
    let selectedDate: any = null

    return {
      selectedDate,
      menu: false,
      ...useVanillaControl(useJsonFormsControl(props))
    }
  },
  created() {
    if (this.dataDateTime) {
      const selected = new Date(this.dataDate)
      const formatted = format(selected, DATE_FORMATS[this.dateFormat])
      this.handleChange(this.control.path, formatted)
    }
  },
  computed: {
    dataDate(): string {
      return (this.control.data || this.defaultDate || '')
    },
    parsedDate() {
      if (this.selectedDate) {
        // @ts-ignore
        return parse(this.selectedDate, this.defaultDateFormat, new Date())
      }
      else {
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
    dateFormat(): string {
      // @ts-ignore
      return this.control.schema.format || "date"
    },
    computedLabel(): string {
      return computeLabel(
        this.control.label as string,
        this.control.required,
        !!this.appliedOptions?.hideRequiredAsterisk
      );
    },
    maxDate() {
      // @ts-ignore
      return this.getDateFromOption(this.control.schema.options?.max)
    },
    minDate() {
      // @ts-ignore
      return this.getDateFromOption(this.control.schema.options?.min)
    },
    defaultDate() {
      // @ts-ignore
      return this.getDateFromOption(this.control.schema.options?.default)
    },
    placeholder() {
      // @ts-ignore
      return this.control.schema.options?.placeholder
    },
    cleanedErrors() {
      // @ts-ignore
      return this.control.errors.replaceAll(`is a required property`, ``)
    }
  },
  methods: {
    onInput(newDate) {
      try {
         if (!this.formattedDate) {
            this.selectedDate = null
            this.handleChange(this.control.path, undefined)
          }
          else {
            this.selectedDate = newDate
            
            if (this.minDate) {
              const minDate = parse(this.minDate, this.defaultDateFormat, new Date())
              if (this.parsedDate.getTime() < minDate.getTime()) {
                this.selectedDate = this.minDate
              }
            }
            
            if (this.maxDate) {
              const maxDate = parse(this.maxDate, this.defaultDateFormat, new Date())
              if (this.parsedDate.getTime() > maxDate.getTime()) {
                this.selectedDate = this.maxDate
              }
            }
            
            this.handleChange(this.control.path, this.formattedDate)
          }
      }
      catch(e) {
        // Let JsonForms validation handle the invalid datestring
        this.handleChange(this.control.path, newDate)
      }
    },
    getDateFromOption(option: string | { amount: number, unit: string }) {
      if (option) {
        if (typeof option === 'string' || option instanceof String) {
          if (option === "today") {
            const targetDate = new Date(Date.now())
            return format(targetDate, DATE_FORMATS[this.dateFormat])
          }
        }
        else if (option.unit && option.amount) {
          const now = new Date(Date.now())

          if (option.unit === 'day') {
            const targetDate = new Date(now.setDate(now.getDate() + option.amount))
            // @ts-ignore
            return format(targetDate, DATE_FORMATS[this.dateFormat])
          }
          else if (option.unit === 'month') {
            const targetDate = new Date(now.setMonth(now.getMonth() + option.amount))
            // @ts-ignore
            return format(targetDate, DATE_FORMATS[this.dateFormat])
          }
          else if (option.unit === 'year') {
            const targetDate = new Date(now.setFullYear(now.getFullYear() + option.amount))
            // @ts-ignore
            return format(targetDate, DATE_FORMATS[this.dateFormat])
          }
        }
      }
    },
    onClear() {
      this.selectedDate = null
      this.handleChange(this.control.path, undefined)
    }
  },
})

export default controlRenderer

export const dateControlRenderer: JsonFormsRendererRegistryEntry = {
  renderer: controlRenderer,
  tester: rankWith(3, isDateControl)
}
</script>
