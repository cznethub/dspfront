<template>
  <v-text-field v-show="control.visible" ref="field"
    @input="onChange"
    :label="control.label"
    :value="control.data"
    :disabled="!control.enabled"
    outlined
  >

    <!-- <label>{{ control.label }}</label>
    <v-input
      @input="onChange"
      :disabled="!control.enabled"
      :required="control.required"
      :value="control.data"
      size="is-medium" 
    />
    <span>{{ control.description }}</span>
    <span v-for="(error, index) in control.errors" :key="index">{{ error }}</span> -->
  </v-text-field>
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
      return useJsonFormsControl(props)
    },
    created() {
      // console.log(this.control)
      
    },
    methods: {
      onChange(value: string) {
        // console.log(this.$refs.field)
        this.handleChange(
          this.control.path,
          value
        )
        // console.log(this.control)
      },
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


