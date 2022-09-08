<template>
  <fieldset
    v-if="layout.visible"
    class="cz-fieldset"
    v-bind="vuetifyProps('v-container')"
  >
    <v-container>
      <v-row>
        <v-col>
          <v-row
            v-for="(element, index) in layout.uischema.elements"
            :data-id="`vertical-${index}`"
            :key="`${layout.path}-${index}`"
            no-gutters
            v-bind="vuetifyProps(`v-row[${index}]`)"
          >
            <v-col cols="12" :class="styles.verticalLayout.item">
              <dispatch-renderer
                :schema="layout.schema"
                :uischema="element"
                :path="layout.path"
                :enabled="layout.enabled"
                :renderers="layout.renderers"
                :cells="layout.cells"
              />
            </v-col>
          </v-row>
        </v-col>
        <v-col>map here</v-col>
      </v-row>
    </v-container>
  </fieldset>
</template>

<script lang="ts">
import {
  uiTypeIs,
  JsonFormsRendererRegistryEntry,
  Layout,
  rankWith,
} from '@jsonforms/core'
import { defineComponent } from '@vue/composition-api'
import {
  DispatchRenderer,
  rendererProps,
  useJsonFormsLayout,
  RendererProps,
} from '@jsonforms/vue2'
import { useVuetifyLayout } from '@jsonforms/vue2-vuetify'
import { VContainer, VRow, VCol } from 'vuetify/lib'

const layoutRenderer = defineComponent({
  name: 'map-layout-renderer',
  components: {
    DispatchRenderer,
    VContainer,
    VRow,
    VCol,
  },
  props: {
    ...rendererProps<Layout>(),
  },
  created() {
    console.log(this.layout)
  },
  setup(props: RendererProps<Layout>) {
    return useVuetifyLayout(
      useJsonFormsLayout(props)
    )
  },
})

export default layoutRenderer
export const mapLayoutRenderer: JsonFormsRendererRegistryEntry = {
  renderer: layoutRenderer,
  tester: rankWith(2, uiTypeIs('MapLayout')),
}
</script>