<script lang="ts">
  /** 
   * This file is used to export all renderers in an array. Could not do it with a simple index.ts file
   */
  import { JsonFormsRendererRegistryEntry } from '@jsonforms/core'
  import { defineComponent } from '@vue/composition-api'
  // import { inputDateRenderer } from './controls/cz.input-date.renderer.vue'
  // import { inputRenderer } from './controls/cz.input.renderer.vue'
  // import { listInputObjectRenderer } from './controls/cz.list-input-object.renderer.vue'
  import { enumControlRenderer } from './controls/cz.enum-control.renderer.vue'
  import { selectRenderer } from './controls/cz.select.renderer.vue'
  import { arrayListRenderer } from './array/ArrayListRenderer.vue'
  import { groupRenderer } from './layouts/GroupRenderer.vue'
  import { numberControlRenderer } from './controls/NumberControlRenderer.vue'
  import { stringControlRenderer } from './controls/StringControlRenderer.vue'
  import { multiStringControlRenderer } from './controls/MultiStringControlRenderer.vue'
  import { dateControlRenderer } from './controls/DateControlRenderer.vue'
  import { dateTimeControlRenderer } from './controls/DateTimeControlRenderer.vue'

  const controlRenderer = defineComponent({})
  export default controlRenderer

  export const CzRenderers: JsonFormsRendererRegistryEntry[] = [
    // inputRenderer,
    // inputDateRenderer,
    selectRenderer,
    enumControlRenderer,
    arrayListRenderer,
    groupRenderer,
    numberControlRenderer,
    stringControlRenderer,
    multiStringControlRenderer,
    dateControlRenderer,
    dateTimeControlRenderer,
    // listInputObjectRenderer,
  ]
</script>
