<template>
  <b-field v-show="control.visible" :label="control.label" :message="control.errors" :type="{ 'is-danger': control.errors }">
    <b-input
      @input="onChange"
      :disabled="!control.enabled"
      :required="control.required"
      :value="control.data"
      :placeholder="control.description"
      size="is-medium" 
    />
  </b-field>
</template>

<script lang="ts">
  import { isStringControl, JsonFormsRendererRegistryEntry, rankWith } from '@jsonforms/core'
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
      // console.log(this.control)
    },
    methods: {
      onChange(value: string) {
        this.handleChange(
          this.control.path,
          value
        )
        // console.log(this.control)
      }
    }
  })
  export default controlRenderer

  export const inputRenderer: JsonFormsRendererRegistryEntry = {
    renderer: controlRenderer,
    tester: rankWith(2, isStringControl)
  }
</script>

<style lang="scss" scoped>
  
</style>


