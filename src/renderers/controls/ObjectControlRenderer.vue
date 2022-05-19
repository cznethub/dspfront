<template>
  <div v-if="control.visible"
    class="cz-object my-4" 
    :class="{ 'is-invalid': control.errors && control.errors.length > 0}" 
    :data-id="computedLabel.replaceAll(` `, ``)"
    >
    <dispatch-renderer
      :visible="control.visible"
      :enabled="control.enabled"
      :schema="control.schema"
      :uischema="detailUiSchema"
      :path="control.path"
      :renderers="control.renderers"
      :cells="control.cells"
    />
    <div v-if="control.errors" class="ml-2 v-messages error--text" style="margin-top: -2rem;"
      :class="styles.control.error">
      {{ control.errors }}
    </div>
  </div>
</template>

<script lang="ts">
import {
  ControlElement,
  findUISchema,
  GroupLayout,
  isObjectControl,
  JsonFormsRendererRegistryEntry,
  rankWith,
  UISchemaElement,
} from '@jsonforms/core'
import isEmpty from 'lodash/isEmpty'
import {
  DispatchRenderer,
  rendererProps,
  RendererProps,
  useJsonFormsControlWithDetail,
} from '@jsonforms/vue2';
import { useVuetifyControl } from '@jsonforms/vue2-vuetify'
import { defineComponent } from '@vue/composition-api'

const controlRenderer = defineComponent({
  name: 'object-renderer',
  components: {
    DispatchRenderer,
  },
  props: {
    ...rendererProps<ControlElement>(),
  },
  setup(props: RendererProps<ControlElement>) {
    return useVuetifyControl(useJsonFormsControlWithDetail(props))
  },
  created() {
    // console.log(this.control)
  },
  methods: {
  },
  computed: {
    detailUiSchema(): UISchemaElement {
      const result = findUISchema(
        this.control.uischemas,
        this.control.schema,
        this.control.uischema.scope,
        this.control.path,
        'Group',
        this.control.uischema,
        this.control.rootSchema
      );
      if (isEmpty(this.control.path)) {
        result.type = 'VerticalLayout'
      } else {
        (result as GroupLayout).label  = this.computedLabel as string
      }
      return result
    },
  },
})
export default controlRenderer;
export const objectControlRenderer: JsonFormsRendererRegistryEntry = {
  renderer: controlRenderer,
  tester: rankWith(2, isObjectControl),
}
</script>