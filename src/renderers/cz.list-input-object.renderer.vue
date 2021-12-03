<template>
  <md-field v-show="control.visible">
    <label>{{ control.label }}</label>
    <div class="md-helper-text">{{ control.description }}</div>
  </md-field>
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
      const items = []
      return {
        items,
        ...useJsonFormsControl(props)
      }
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


