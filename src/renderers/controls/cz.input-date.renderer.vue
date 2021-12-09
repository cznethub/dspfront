<template>
  <md-datepicker md-immediately
    v-show="control.visible"
    @input="onChange"
    v-model="selectedDate"
    :disabled="!control.enabled"
    :required="control.required"
    :value="control.data"
  >
    <label>{{ control.label }}</label>
    <div class="md-helper-text">{{ control.description }}</div>
    <div v-if="control.errors" class="md-error-">{{ control.errors }}</div>
  </md-datepicker>
</template>

<script lang="ts">
  import { isDateTimeControl, JsonFormsRendererRegistryEntry, rankWith } from '@jsonforms/core'
  import { defineComponent } from '@vue/composition-api'
  import { rendererProps, useJsonFormsControl } from '@jsonforms/vue2'
  import format from 'date-fns/format'

  // https://stackoverflow.com/questions/40369287/what-pattern-should-be-used-to-parse-rfc-3339-datetime-strings-in-java
  // TODO: add the rest of date formats used by jsonschema
  const dateFormats = {
    'date-time': "yyyy-MM-dd'T'HH:mm:ssXXX"
  }

  // https://www.npmjs.com/package/@jsonforms/vue2

  const controlRenderer = defineComponent({
    name: 'control-renderer',
    props: {
      ...rendererProps()
    },
    setup(props:any) {
      let selectedDate = null

      return {
        selectedDate,
        ...useJsonFormsControl(props)
      }
    },
    created() {
    },
    methods: {
      onChange(value: Date) {
        const schemaDateFormat = this.control.schema.format || 'date-time'
        const formattedValue = format(value, dateFormats[schemaDateFormat])
        this.handleChange(
          this.control.path,
         formattedValue
        )
      }
    }
  })
  export default controlRenderer

  export const inputDateRenderer: JsonFormsRendererRegistryEntry = {
    renderer: controlRenderer,
    tester: rankWith(3, isDateTimeControl)
  }
</script>

<style lang="scss" scoped>
  
</style>


