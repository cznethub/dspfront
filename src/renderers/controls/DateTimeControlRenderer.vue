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
        :label="computedLabel"
        :hint="control.description"
        :error-messages="control.errors"
        persistent-hint
        class="my-2"
        prepend-icon="mdi-calendar"
        outlined
        clearable
        v-bind="attrs"
        v-on="on"
        style="max-width: 20rem;"
        dense
      />
    </template>

    <v-row no-gutters>
      <v-col>
        <v-date-picker
          v-model="selectedDate" 
          @change="onInput($event)"
          :disabled="!control.enabled"
          scrollable
        />
      </v-col>
      
      <v-col>
        <v-time-picker
          v-model="selectedTime"
          @input="onInput($event)"
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
    let selectedDate = null
    let selectedTime = DEFAULT_TIME

    return {
      selectedDate,
      selectedTime,
      defaultTime: DEFAULT_TIME,
      menu: false,
      ...useVanillaControl(useJsonFormsControl(props))
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
      // @ts-ignore
      return this.selectedDatetime ? format(this.selectedDatetime, DATE_FORMATS[this.dateTimeFormat]) : ''
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
      this.handleChange(this.control.path, this.formattedDatetime)
    },
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
