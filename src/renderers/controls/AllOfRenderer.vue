<template>
  <div class="my-4">
    <fieldset v-if="control.visible" class="cz-fieldset" :data-id="control.schema.title.replaceAll(` `, ``)">
      <legend v-if="control.schema.title" class="v-label--active">{{ control.schema.title }}</legend>
      <template v-if="delegateUISchema">
        <dispatch-renderer
          :schema="subSchema"
          :uischema="delegateUISchema"
          :path="control.path"
          :enabled="control.enabled"
          :renderers="control.renderers"
          :cells="control.cells"
        />
      </template>
      <template v-else-if="allOfRenderInfos">
        <dispatch-renderer
          v-for="(allOfRenderInfo, allOfIndex) in allOfRenderInfos"
          :key="`${control.path}-${allOfIndex}`"
          :schema="allOfRenderInfo.schema"
          :uischema="allOfRenderInfo.uischema"
          :path="control.path"
          :enabled="control.enabled"
          :renderers="control.renderers"
          :cells="control.cells"
        />
      </template>
    </fieldset>
    <div class="text--secondary text-caption mb-8 ml-4">{{ control.schema.description }}</div>
  </div>
</template>

<script lang="ts">
import {
  CombinatorSubSchemaRenderInfo,
  ControlElement,
  createCombinatorRenderInfos,
  findMatchingUISchema,
  isAllOfControl,
  JsonFormsRendererRegistryEntry,
  JsonSchema,
  rankWith,
  resolveSubSchemas,
  UISchemaElement,
} from '@jsonforms/core'
import {
  DispatchRenderer,
  rendererProps,
  RendererProps,
  useJsonFormsAllOfControl,
} from '@jsonforms/vue2'
import { defineComponent } from "@vue/composition-api"
import { useVuetifyControl } from '@jsonforms/vue2-vuetify'

const controlRenderer = defineComponent({
  name: 'all-of-renderer',
  components: {
    DispatchRenderer,
  },
  props: {
    ...rendererProps<ControlElement>(),
  },
  setup(props: RendererProps<ControlElement>) {
    return useVuetifyControl(useJsonFormsAllOfControl(props));
  },
  created() {
    // console.log(this.control)
  },
  computed: {
    subSchema(): JsonSchema {
      return resolveSubSchemas(
        this.control.schema,
        this.control.rootSchema,
        'allOf'
      );
    },
    delegateUISchema(): UISchemaElement {
      return findMatchingUISchema(this.control.uischemas)(
        this.subSchema,
        this.control.uischema.scope,
        this.control.path
      );
    },
    allOfRenderInfos(): CombinatorSubSchemaRenderInfo[] {
      return createCombinatorRenderInfos(
        this.subSchema.allOf!,
        this.control.rootSchema,
        'allOf',
        this.control.uischema,
        this.control.path,
        this.control.uischemas
      );
    },
  },
});

export default controlRenderer;

export const allOfRenderer: JsonFormsRendererRegistryEntry = {
  renderer: controlRenderer,
  tester: rankWith(3, isAllOfControl),
};
</script>