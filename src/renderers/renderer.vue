<script lang="ts">
  /** 
   * This file is used to export all renderers in an array. Could not do it with a simple index.ts file
   */
  import { JsonFormsRendererRegistryEntry } from '@jsonforms/core'
  import { defineComponent } from 'vue'
  // import { arrayControlRenderer } from './array/ArrayControlRenderer.vue'
  import { groupRenderer } from './layouts/GroupRenderer.vue'
  import { numberControlRenderer } from './controls/NumberControlRenderer.vue'
  import { stringControlRenderer } from './controls/StringControlRenderer.vue'
  import { multiStringControlRenderer } from './controls/MultiStringControlRenderer.vue'
  import { dateControlRenderer } from './controls/DateControlRenderer.vue'
  import { dateTimeControlRenderer } from './controls/DateTimeControlRenderer.vue'
  import { objectControlRenderer } from './controls/ObjectControlRenderer.vue'
  import { enumControlRenderer } from './controls/EnumControlRenderer.vue'
  import { arrayPrimitiveControlRenderer } from './array/ArrayPrimitiveControlRenderer.vue'
  import { anyOfRenderer } from './controls/AnyOfRenderer.vue'
  import { allOfRenderer } from './controls/AllOfRenderer.vue'
  import { radioGroupControlRenderer } from './controls/RadioGroupControlRenderer.vue'
  import { verticalLayoutRenderer } from './layouts/VerticalLayoutRenderer.vue'
  import { horizontalLayoutRenderer } from './layouts/HorizontalLayoutRenderer.vue'
  import { integerControlRenderer } from './controls/IntegerControlRenderer.vue'
  import { anyOfStringOrControlRenderer } from './controls/AnyOfStringOrControlRenderer.vue'
  import { enumArrayRenderer } from './controls/EnumArrayRenderer.vue'
  import { oneOfRenderer } from './controls/OneOfRenderer.vue'
  import { oneOfEnumControlRenderer } from './controls/OneOfEnumControlRenderer.vue'
  import { arrayLayoutRenderer } from './layouts/ArrayLayoutRenderer.vue'
  import { booleanControlRenderer } from './controls/BooleanControlRenderer.vue'
  import { mapLayoutRenderer } from './layouts/MapLayoutRenderer.vue'
  import { objectRenderer } from './layouts/ObjectLayoutRenderer.vue'

  const controlRenderer = defineComponent({})
  export default controlRenderer

  export const CzRenderers: JsonFormsRendererRegistryEntry[] = [
    enumControlRenderer,
    enumArrayRenderer,
    arrayPrimitiveControlRenderer,
    // arrayControlRenderer,
    groupRenderer,
    numberControlRenderer,
    stringControlRenderer,
    multiStringControlRenderer,
    dateControlRenderer,
    dateTimeControlRenderer,
    objectControlRenderer,
    anyOfRenderer,
    oneOfRenderer,
    oneOfEnumControlRenderer,
    allOfRenderer,
    radioGroupControlRenderer,
    verticalLayoutRenderer,
    horizontalLayoutRenderer,
    mapLayoutRenderer,
    arrayLayoutRenderer,
    integerControlRenderer,
    anyOfStringOrControlRenderer,
    booleanControlRenderer,
    objectRenderer
  ]
</script>
