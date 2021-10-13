<template>
  <b-field :label="control.label">
    <b-input size="is-medium" :value="control.data" @change.native="onChange" :placeholder="control.description" :message="control.errors" />
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
    methods: {
      onChange(event: Event) {
        // console.log(this.control)
        this.handleChange(
          this.control.path,
          (event.target as HTMLInputElement).value
        )
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


