<template>
  <b-field :label="control.label">
    <b-taginput
      size="is-medium"
      v-model="tags"
      @input="onChange"
      ellipsis
      type="is-info"
      icon="tag"
      icon-pack
      :placeholder="control.description"
      aria-close-label="Delete this tag">
    </b-taginput>
  </b-field>
</template>

<script lang="ts">
  import { isPrimitiveArrayControl, JsonFormsRendererRegistryEntry, rankWith } from '@jsonforms/core'
  import { defineComponent } from '@vue/composition-api'
  import { rendererProps, useJsonFormsControl } from '@jsonforms/vue2'

  // https://www.npmjs.com/package/@jsonforms/vue2

  const controlRenderer = defineComponent({
    name: 'control-renderer',
    props: {
      ...rendererProps()
    },
    setup(props: any) {
      let tags = []
      return {
        tags,
        ...useJsonFormsControl(props),
      }
    },
    created() {
      // console.log(this.control)
    },
    methods: {
      onChange(values) {
        this.handleChange(
          this.control.path,
          values
        )
      }
    }
  })
  export default controlRenderer

  export const listInputPrimitiveRenderer: JsonFormsRendererRegistryEntry = {
    renderer: controlRenderer,
    tester: rankWith(3, isPrimitiveArrayControl)
  }
</script>

<style lang="scss" scoped>
  
</style>


