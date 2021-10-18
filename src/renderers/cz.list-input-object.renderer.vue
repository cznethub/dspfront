<template>
  <b-field :label="control.label" :message="control.errors" :type="{ 'is-danger': control.errors }">
    list input object here
    <!-- <b-select size="is-medium" 
      @input="onChange"
      :disabled="!control.enabled"
      :required="control.required"
      :placeholder="control.description"
      :value="control.schema.default"
    >
      <option
        v-for="option in control.schema.enum"
        :value="option"
        :key="option"
      >
        {{ option }}
      </option>
    </b-select> -->
  </b-field>
</template>

<script lang="ts">
  import { isObjectArrayControl, JsonFormsRendererRegistryEntry, rankWith } from '@jsonforms/core'
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

  export const listInputObjectRenderer: JsonFormsRendererRegistryEntry = {
    renderer: controlRenderer,
    tester: rankWith(3, isObjectArrayControl)
  }
</script>

<style lang="scss" scoped>
  
</style>


