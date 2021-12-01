<template>
  <md-field v-show="control.visible" md-dense>
    <label>{{ control.label }}</label>
    <md-select
      @input="onChange"
      :disabled="!control.enabled"
      :required="control.required"
      :value="control.schema.default"
    >
      <md-option
        v-for="option in control.schema.enum"
        :value="option"
        :key="option"
      >
        {{ option }}
      </md-option>
    </md-select>
    <div class="md-helper-text">{{ control.description }}</div>
  </md-field>
</template>

<script lang="ts">
  import { isEnumControl, JsonFormsRendererRegistryEntry, rankWith } from '@jsonforms/core'
  import { defineComponent } from '@vue/composition-api'
  import { rendererProps, useJsonFormsControl } from '@jsonforms/vue2'

  // https://www.npmjs.com/package/@jsonforms/vue2

  const controlRenderer = defineComponent({
    name: 'control-renderer',
    props: {
      ...rendererProps()
    },
    setup(props:any) {
      return useJsonFormsControl(props);
    },
    created() {
      console.log(this.control)
    },
    methods: {
      onChange(value) {
        this.handleChange(
          this.control.path,
          value
        )
      }
    }
  })
  export default controlRenderer

  export const selectRenderer: JsonFormsRendererRegistryEntry = {
    renderer: controlRenderer,
    tester: rankWith(3, isEnumControl)
  }
</script>

<style lang="scss" scoped>
  
</style>


