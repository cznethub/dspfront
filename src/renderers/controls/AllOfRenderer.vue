<template>
  <div class="py-3">
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
    <div v-if="description" class="text--secondary text-body-1 mt-2 ml-2">{{ description }}</div>
    <div v-if="cleanedErrors" class="ml-2 v-messages error--text">
      <v-divider v-if="isFlat" class="mb-4"></v-divider>
      {{ cleanedErrors }}
    </div>
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
  rankWith,
  UISchemaElement,
} from '@jsonforms/core'
import {
  DispatchRenderer,
  rendererProps,
  RendererProps,
  useJsonFormsAllOfControl,
} from '@jsonforms/vue2'
import { defineComponent } from 'vue'
import { useVuetifyControl } from '@/renderers/util/composition';

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
  computed: {
    delegateUISchema(): UISchemaElement {
      return findMatchingUISchema(this.control.uischemas)(
        this.control.schema,
        this.control.uischema.scope,
        this.control.path
      );
    },
    allOfRenderInfos(): CombinatorSubSchemaRenderInfo[] {
      const info = createCombinatorRenderInfos(
        this.control.schema.allOf!,
        this.control.rootSchema,
        'allOf',
        this.control.uischema,
        this.control.path,
        this.control.uischemas
      );

      // JsonSchema does not pass the required attribute, so we do it ourselves
      info.map(i => { 
        i.schema.required = this.control.schema.required
        // @ts-ignore: use detail uischema if specified
        i.uischema = i.schema.options?.detail || i.uischema
      })
      return info
    },
    cleanedErrors() {
      // @ts-ignore
      return this.control.errors.replaceAll(`is a required property`, ``)
    },
    description(): string {
      return this.control.description
      || this.control.schema?.description 
      || this.appliedOptions.description
      || ''
    },
  },
});

export default controlRenderer;

export const allOfRenderer: JsonFormsRendererRegistryEntry = {
  renderer: controlRenderer,
  tester: rankWith(3, isAllOfControl),
};
</script>