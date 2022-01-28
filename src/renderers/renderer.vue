<script lang="ts">
  /** 
   * This file is used to export all renderers in an array. Could not do it with a simple index.ts file
   */
  import { JsonFormsRendererRegistryEntry } from '@jsonforms/core'
  import { defineComponent } from '@vue/composition-api'
  import { arrayControlRenderer } from './array/ArrayControlRenderer.vue'
  import { groupRenderer } from './layouts/GroupRenderer.vue'
  import { numberControlRenderer } from './controls/NumberControlRenderer.vue'
  import { stringControlRenderer } from './controls/StringControlRenderer.vue'
  import { multiStringControlRenderer } from './controls/MultiStringControlRenderer.vue'
  import { dateControlRenderer } from './controls/DateControlRenderer.vue'
  import { dateTimeControlRenderer } from './controls/DateTimeControlRenderer.vue'
  import { objectControlRenderer } from './controls/ObjectControlRenderer.vue'
  import { enumControlRenderer } from './controls/EnumControlRenderer.vue'
  import { arrayPrimitiveRenderer } from './array/ArrayPrimitiveControl.vue'

  const controlRenderer = defineComponent({})
  export default controlRenderer

  export const CzRenderers: JsonFormsRendererRegistryEntry[] = [
    enumControlRenderer,
    arrayControlRenderer,
    groupRenderer,
    numberControlRenderer,
    stringControlRenderer,
    multiStringControlRenderer,
    dateControlRenderer,
    dateTimeControlRenderer,
    objectControlRenderer,
    arrayPrimitiveRenderer
  ]
</script>
