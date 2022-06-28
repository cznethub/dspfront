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
        @click:clear="selectedDate = null; selectedTime = defaultTime"
        @change="onInput($event)"
        :disabled="!control.enabled"
        :value="dataDateTime"
        :id="control.id + '-input'"
        :data-id="computedLabel.replaceAll(` `, ``)"
        :label="computedLabel"
        :hint="control.description"
        :error-messages="control.errors"
        :placeholder="placeholder"
        persistent-hint
        class="py-3"
        prepend-icon="mdi-calendar"
        outlined
        clearable
        v-bind="attrs"
        v-on="on"
        dense
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

    <v-row no-gutters>
      <v-col>
        <v-date-picker
          v-model="selectedDate" 
          @change="onDatePickerInput($event)"
          :disabled="!control.enabled"
          scrollable
        />
      </v-col>
      
      <v-col>
        <v-time-picker
          v-model="selectedTime"
          @input="onTimePickerInput($event)"
          :disabled="!control.enabled"
          scrollable
        />
      </v-col>
    </v-row>
  </v-menu>
</template>

<script lang="ts">
import {
  ControlElement,
  JsonFormsRendererRegistryEntry,
  rankWith,
  isDateTimeControl
} from '@jsonforms/core'
import { defineComponent } from '@vue/composition-api'
import { rendererProps, useJsonFormsControl, RendererProps } from '@jsonforms/vue2'
import { format, parse } from 'date-fns'
import { computeLabel } from '@jsonforms/core'
import { useVanillaControl } from "@jsonforms/vue2-vanilla"

const DEFAULT_TIME = '00:00:00'
const DEFAULT_TIME_FORMAT = 'HH:mm:ss'
const DEFAULT_DATE_FORMAT = 'yyyy-MM-dd'

// https://stackoverflow.com/questions/40369287/what-pattern-should-be-used-to-parse-rfc-3339-datetime-strings-in-java
// TODO: add the rest of date formats used by jsonschema
const DATE_FORMATS = {
  "date-time": "yyyy-MM-dd'T'HH:mm:ssXXX",
}

const controlRenderer = defineComponent({
  name: 'datetime-control-renderer',
  components: {
    // ControlWrapper
  },
  props: {
    ...rendererProps<ControlElement>()
  },
  setup(props: RendererProps<ControlElement>) {
    let selectedDate: any = null
    let selectedTime: any = DEFAULT_TIME

    return {
      selectedDate,
      selectedTime,
      defaultTime: DEFAULT_TIME,
      menu: false,
      ...useVanillaControl(useJsonFormsControl(props))
    }
  },
  created() {
    if (this.dataDateTime) {
      // Format data value and populate the form
      const selected = new Date(this.dataDateTime) // in UTC
      const offset = selected.getTimezoneOffset() * 60 * 1000
      const localDateTime = selected.getTime() + offset
      const localizedDate = new Date(localDateTime) // in local time

      const formatted = format(localizedDate, DATE_FORMATS[this.dateTimeFormat])
      this.handleChange(this.control.path, formatted)
    }
  },
  computed: {
    dataDateTime(): string {
      return (this.control.data ?? '').substr(0, 16)
    },
    selectedDatetime() {
      if (this.selectedDate && this.selectedTime) {
        // @ts-ignore
        let datetimeString = this.selectedDate + ' ' + this.selectedTime
        if (this.selectedTime.length === 5) {
          datetimeString += ':00'
        }
        // @ts-ignore
        return parse(datetimeString, this.defaultDateTimeFormat, new Date())
      } else {
        return null
      }
    },
    dateTimeFormat() {
      // @ts-ignore
      return this.control.schema.format || "date-time"
    },
    defaultDateTimeFormat() {
      return DEFAULT_DATE_FORMAT + ' ' + DEFAULT_TIME_FORMAT
    },
    formattedDatetime() {
      return this.selectedDatetime 
        // @ts-ignore
        ? format(this.selectedDatetime, DATE_FORMATS[this.dateTimeFormat])
        : ''
    },
    computedLabel(): string {
      return computeLabel(
        this.control.label as string,
        this.control.required,
        !!this.appliedOptions?.hideRequiredAsterisk
      );
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
    onInput(dateTimeString) {
      if (dateTimeString) {
        // Datetime was input by typing. We most parse back the values.
        try{
          const selectedDateTime = new Date(dateTimeString) // UTC
          const offset = selectedDateTime.getTimezoneOffset() * 60 * 1000
          const localDateTime = selectedDateTime.getTime() - offset
          const localizedDate = new Date(localDateTime) // in local time
          this.selectedDate = localizedDate.toISOString().split('T')[0]
          this.selectedTime = localizedDate.toISOString().split('T')[1].split('.')[0]
          this.handleChange(this.control.path, this.formattedDatetime)
        }
        catch(e) {
          // Let JsonForms validation handle the invalid datestring
          this.handleChange(this.control.path, dateTimeString)
        }
      }
      else {
        // Datetime input using widget. Values already updated, no need to parse.
        this.handleChange(this.control.path, this.formattedDatetime)
      }
    },
    onDatePickerInput(dateString: string) {
      this.selectedDate = dateString
      this.onInput(null)
    },
    onTimePickerInput(timeString: string) {
      this.selectedTime = timeString
      this.onInput(null)
    }
  },
})

export default controlRenderer;

export const dateTimeControlRenderer: JsonFormsRendererRegistryEntry = {
  renderer: controlRenderer,
  tester: rankWith(3, isDateTimeControl)
};
</script>

<style scoped lang="scss">
  ::v-deep .v-time-picker-title__time {
    .v-picker__title__btn,
    span {
      font-size: 34px;
      height: 34px;
    }
  }

  ::v-deep .v-picker--time .v-picker__title {
    padding: 27px 16px;
  }

  ::v-deep .v-picker.v-picker--time,
  ::v-deep .v-picker.v-picker--time .v-picker__title {
    border-top-left-radius: 0 !important;
  }

  ::v-deep .v-picker.v-picker--date,
  ::v-deep .v-picker.v-picker--date .v-picker__title {
    border-top-right-radius: 0 !important;
  }
</style>
