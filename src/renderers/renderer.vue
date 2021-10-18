<script lang="ts">
  /** 
   * This file is used to export all renderers in an array. Could not do it with a simple index.ts file
   */
  import { JsonFormsRendererRegistryEntry } from '@jsonforms/core'
  import { defineComponent } from '@vue/composition-api'
  import { inputRenderer } from './cz.input.renderer.vue'
  import { listInputObjectRenderer } from './cz.list-input-object.renderer.vue'
  import { listInputPrimitiveRenderer } from './cz.list-input-primitive.renderer.vue'
  import { selectRenderer } from './cz.select.renderer.vue'

  const controlRenderer = defineComponent({})
  export default controlRenderer

  export const CzRenderers: JsonFormsRendererRegistryEntry[] = [
    inputRenderer,
    selectRenderer,
    listInputPrimitiveRenderer,
    // listInputObjectRenderer,
  ]
</script>
