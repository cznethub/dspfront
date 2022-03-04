<template>
  <div>  
    <fieldset v-if="layout.visible" :class="`cz-fieldset mt-2 pt-4 ${styles.group.root}`" >
      <legend v-if="layout.uischema.label" :class="styles.group.label" class="v-label--active">{{ layout.uischema.label }}</legend>
      <div
        v-for="(element, index) in layout.uischema.elements"
        :key="`${layout.path}-${index}`"
        :class="styles.group.item"
      >
        <dispatch-renderer
          :schema="layout.schema"
          :uischema="element"
          :path="layout.path"
          :enabled="layout.enabled"
          :renderers="layout.renderers"
          :cells="layout.cells"
        />
      </div>
    </fieldset>
    <div class="text--secondary text-caption mb-8 ml-4">{{ layout.schema.description }}</div>
  </div>
</template>

<script lang="ts">
import {
  JsonFormsRendererRegistryEntry,
  Layout,
  rankWith,
  and,
  isLayout,
  uiTypeIs
} from '@jsonforms/core'
import { defineComponent } from '@vue/composition-api'
import {
  DispatchRenderer,
  rendererProps,
  useJsonFormsLayout,
  RendererProps
} from '@jsonforms/vue2'
import { useVuetifyLayout } from '@jsonforms/vue2-vuetify'

const layoutRenderer = defineComponent({
  name: 'group-renderer',
  components: {
    DispatchRenderer
  },
  props: {
    ...rendererProps<Layout>()
  },
  created() {
    // console.log(this)
  },
  setup(props: RendererProps<Layout>) {
    return useVuetifyLayout(
      useJsonFormsLayout(props)
    )
  }
})

export default layoutRenderer

export const groupRenderer: JsonFormsRendererRegistryEntry = {
  renderer: layoutRenderer,
  tester: rankWith(3, and(isLayout, uiTypeIs('Group')))
}
</script>
