<template>
    <md-chips 
      @input="onChange" 
      v-model="tags"
      :md-placeholder="control.label"
      @keydown.native="onKeyDown"
      class="md-primary shake-on-error"
      ref="chips"
    > 
      <div class="md-helper-text">{{ control.description }}</div>
    </md-chips>
</template>

<script lang="ts">
  import { isPrimitiveArrayControl, JsonFormsRendererRegistryEntry, rankWith } from '@jsonforms/core'
  import { defineComponent } from '@vue/composition-api'
  import { rendererProps, useJsonFormsControl } from '@jsonforms/vue2'
  import { MdChips } from 'vue-material/dist/components'

  // https://www.npmjs.com/package/@jsonforms/vue2

  const controlRenderer = defineComponent({
    name: 'control-renderer',
    props: {
      ...rendererProps()
    },
    setup(props: any) {
      const tags = []
      return {
        tags,
        ...useJsonFormsControl(props),
      }
    },
    created() {
      // console.log(this.control)
      this.tags = this.control.schema.default
    },
    methods: {
      onChange(values) {
        this.handleChange(
          this.control.path,
          values
        )
      },
      onKeyDown(e) {
        const delimeters = [
          'Comma',
        ]
        if (delimeters.includes(e.code)) {
          const chips = this.$refs.chips as MdChips

          if (chips) {
            const newKeyword = chips.inputValue
            if (newKeyword) {
              chips.insertChip(newKeyword)
              e.preventDefault()
            }
          }
        }
      }
    }
  })
  export default controlRenderer

  export const enumControlRenderer: JsonFormsRendererRegistryEntry = {
    renderer: controlRenderer,
    tester: rankWith(3, isPrimitiveArrayControl)
  }
</script>

<style lang="scss" scoped>
  
</style>


