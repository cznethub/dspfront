<template>
  <b-field :label="control.label" :message="control.errors" :type="{ 'is-danger': control.errors }">
    <b-select size="is-medium" 
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
    </b-select>
  </b-field>
</template>

<script lang="ts">
  import { isEnumControl, JsonFormsRendererRegistryEntry, rankWith } from '@jsonforms/core'
  import { defineComponent } from '@vue/composition-api'
  import { rendererProps, useJsonFormsControl } from '@jsonforms/vue2'

    // <b-field :label="control.label">
    //   <b-input size="is-medium" :value="control.data" @change.native="onChange" :placeholder="control.description" :message="control.errors" />
    // </b-field>

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


