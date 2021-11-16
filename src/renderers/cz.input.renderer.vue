<template>
  <md-field v-show="control.visible" ref="field">
    <label>{{ control.label }}</label>
    <md-input
      @input="onChange"
      :disabled="!control.enabled"
      :required="control.required"
      :value="control.data"
      size="is-medium" 
    />
    <span class="md-helper-text">{{ control.description }}</span>
    <span v-for="(error, index) in control.errors" :key="index" class="md-error">{{ error }}</span>
  </md-field>
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
        console.log(this.$refs.field)
        this.handleChange(
          this.control.path,
          value
        )
        // console.log(this.control)
      },
      // getValidationClass (fieldName) {
      //   const field = this.$v.form[fieldName]

      //   if (field) {
      //     return {
      //       'md-invalid': field.$invalid && field.$dirty
      //     }
      //   }
      // }
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


