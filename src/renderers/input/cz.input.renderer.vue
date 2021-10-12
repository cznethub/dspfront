<template>
  <div>
    <b-field :label="control.label">
      <b-input :value="control.data" @change.native="onChange" :message="control.errors" />
    </b-field>

    <div class="error" v-if="control.errors">{{ control.errors }}</div>
  </div>
</template>

<script lang="ts">
  import { isStringControl, JsonFormsRendererRegistryEntry, rankWith } from '@jsonforms/core'
  import { defineComponent } from '@vue/composition-api'
  import { rendererProps, useJsonFormsControl } from '@jsonforms/vue2'

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
        this.handleChange(
          
          this.control.path,
          (event.target as HTMLInputElement).value
        );
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


