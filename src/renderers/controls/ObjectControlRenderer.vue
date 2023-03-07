<template>
  <div v-if="isFlat"
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
    <div v-if="control.errors || description">
      <div class="text--secondary text-body-1 ml-2">{{ description }}</div>
      <div v-if="control.errors" class="ml-2 v-messages error--text"
        :class="styles.control.error">
        {{ control.errors }}
      </div>
    </div>
  </div>

  <fieldset v-else class="cz-fieldset my-4" :class="{ 'is-invalid': control.errors && control.errors.length > 0}"
    :data-id="computedLabel.replaceAll(` `, ``)">
    <legend class="v-label v-label--active">{{ computedLabel }}</legend>
    <dispatch-renderer
      :visible="control.visible"
      :enabled="control.enabled"
      :schema="control.schema"
      :uischema="detailUiSchema"
      :path="control.path"
      :renderers="control.renderers"
      :cells="control.cells"
    />
  </fieldset>
</template>

<script lang="ts">
import {
  ControlElement,
  findUISchema,
  Generate,
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
import cloneDeep from 'lodash/cloneDeep';
import { useNested, useVuetifyControl } from '@jsonforms/vue2-vuetify'
import { defineComponent } from 'vue'

const controlRenderer = defineComponent({
  name: 'object-renderer',
  components: {
    DispatchRenderer,
  },
  props: {
    ...rendererProps<ControlElement>(),
  },
  setup(props: RendererProps<ControlElement>) {
    const control = useVuetifyControl(useJsonFormsControlWithDetail(props));
    const nested = useNested('object');
    return {
      ...control,
      input: control,
      nested,
    };
  },
  created() {
    // console.log(this.control)
  },
  methods: {
  },
  computed: {
    detailUiSchema(): UISchemaElement {
      const uiSchemaGenerator = () => {
        const uiSchema = Generate.uiSchema(this.control.schema, 'Group');
        if (isEmpty(this.control.path)) {
          uiSchema.type = 'VerticalLayout';
        } else {
          (uiSchema as GroupLayout).label = this.control.label;
        }
        return uiSchema;
      };
      let result = findUISchema(
        this.control.uischemas,
        this.control.schema,
        this.control.uischema.scope,
        this.control.path,
        uiSchemaGenerator,
        this.control.uischema,
        this.control.rootSchema
      );
      if (this.nested.level > 0) {
        result = cloneDeep(result);
        result.options = {
          ...result.options,
          bare: true,
          alignLeft:
            this.nested.level >= 4 || this.nested.parentElement === 'array',
        };
      }
      return result;
    },
    isFlat() {
      // We show objects as flat by default
      // @ts-ignore
      return this.control.schema.options?.flat !== false
    },
    description(): string {
      return this.control.description || this.appliedOptions.description || ''
    },
  },
})
export default controlRenderer;
export const objectControlRenderer: JsonFormsRendererRegistryEntry = {
  renderer: controlRenderer,
  tester: rankWith(2, isObjectControl),
}
</script>