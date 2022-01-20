<template>
  <v-select
    v-show="control.visible"
    @input="onChange"
    :items="control.schema.enum"
    :label="control.label"
    :disabled="!control.enabled"
    :value="control.schema.default"
    outlined
  >
  </v-select>
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
      // console.log(this.control)
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


