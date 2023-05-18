<template>
  <fieldset
    v-if="layout.visible"
    :class="`cz-fieldset my-4 ${styles.group.root}`"
    :data-id="generateId"
  >
    <legend
      v-if="layout.label"
      class="v-label v-label--active"
    >
      {{ layout.label }}
    </legend>

    <div
      v-if="layout.uischema.description"
      class="text-subtitle-1 text--secondary mb-6"
    >
      {{ layout.uischema.description }}
    </div>

    <div
      v-for="(element, index) in layout.uischema.elements"
      :data-id="`group-${index}`"
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
</template>

<script lang="ts">
import {
  JsonFormsRendererRegistryEntry,
  Layout,
  rankWith,
  and,
  isLayout,
  uiTypeIs,
  
} from "@jsonforms/core";
import { defineComponent } from "vue";
import {
  DispatchRenderer,
  rendererProps,
  RendererProps,
  useJsonFormsLayout
} from "@jsonforms/vue";
import { useVuetifyLayout } from "@/renderers/util/composition";

const layoutRenderer = defineComponent({
  name: "group-renderer",
  components: {
    DispatchRenderer,
  },
  props: {
    ...rendererProps<Layout>(),
  },
  setup(props: RendererProps<Layout>) {
    return useVuetifyLayout(useJsonFormsLayout(props));
  },
  computed: {
    generateId(): string {
      // @ts-ignore
      return `group-${this.layout.uischema.label?.replaceAll(" ", "")}`;
    },
  },
});

export default layoutRenderer;

export const groupRenderer: JsonFormsRendererRegistryEntry = {
  renderer: layoutRenderer,
  tester: rankWith(3, and(isLayout, uiTypeIs("Group"))),
};
</script>
