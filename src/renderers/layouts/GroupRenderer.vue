<template>
  <fieldset v-if="layout.visible" :class="`cz-fieldset my-8 ${styles.group.root}` " >
    <legend v-if="layout.uischema.label" :class="styles.group.label" class="v-label--active">{{ layout.uischema.label }}</legend>
    <div
      v-for="(element, index) in layout.uischema.elements"
      :key="`${layout.path}-${index}`"
      class="my-4"
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
  RendererProps,
  useJsonFormsLayout,
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
