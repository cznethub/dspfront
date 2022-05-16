<template>
  <div class="my-4" :data-id="control.schema.title.replaceAll(` `, ``)">
    <fieldset v-if="control.visible" :class="styles.control.root" class="cz-fieldset">
      <legend v-if="control.uischema.label" 
        @click="showForm()" :class="{ 'v-label--active': isAdded }" class="v-label">{{ control.uischema.label }}</legend>

      <div v-if="!control.required">
        <v-tooltip v-if="!isAdded" bottom transition="fade">
          <template v-slot:activator="{ on: onTooltip }">
            <v-btn icon color="primary"
              @click="showForm()" 
              :class="styles.arrayList.addButton"
              class="btn-add" 
              :aria-label="`Add to ${control.label}`"
              v-on="onTooltip"
            >
              <v-icon>mdi-plus</v-icon>
            </v-btn>
          </template>
          {{ `Add ${control.uischema.label}` }}
        </v-tooltip>

        <v-tooltip v-else bottom transition="fade">
          <template v-slot:activator="{ on: onTooltip }">
            <v-btn icon color="error"
              @click="removeForm()" 
              :class="styles.arrayList.addButton"
              class="btn-add" 
              aria-label="Remove"
              v-on="onTooltip"
            >
              <v-icon>mdi-minus</v-icon>
            </v-btn>
          </template>
          Remove
        </v-tooltip>
      </div>

      <template v-if="isAdded || control.required">
        <combinator-properties
          :schema="subSchema"
          combinatorKeyword="anyOf"
          :path="path"
        />

        <v-tabs v-model="selectedIndex">
          <v-tab
            v-for="(anyOfRenderInfo, anyOfIndex) in anyOfRenderInfos"
            :key="`${control.path}-${anyOfIndex}`"
          >
            {{ anyOfRenderInfo.label }}
          </v-tab>
        </v-tabs>
        <v-divider></v-divider>

        <v-tabs-items v-model="selectedIndex">
          <v-tab-item
            v-for="(anyOfRenderInfo, anyOfIndex) in anyOfRenderInfos"
            :key="`${control.path}-${anyOfIndex}`"
          >
            <div class="pt-4">
              <dispatch-renderer
                v-if="selectedIndex === anyOfIndex"
                :schema="anyOfRenderInfo.schema"
                :uischema="anyOfRenderInfo.uischema"
                :path="control.path"
                :renderers="control.renderers"
                :cells="control.cells"
              />
            </div>
          </v-tab-item>
        </v-tabs-items>
      </template>
    </fieldset>
    <div class="text-caption text--secondary">{{ control.schema.description }}</div>
  </div>
</template>

<script lang="ts">
import {
  CombinatorSubSchemaRenderInfo,
  ControlElement,
  createCombinatorRenderInfos,
  isAnyOfControl,
  JsonFormsRendererRegistryEntry,
  JsonSchema,
  rankWith,
  resolveSubSchemas,
} from '@jsonforms/core';
import {
  DispatchRenderer,
  rendererProps,
  RendererProps,
  useJsonFormsAnyOfControl,
} from '@jsonforms/vue2';
import { VTabs, VTab, VTabsItems, VTabItem } from 'vuetify/lib'
import { defineComponent, ref } from "@vue/composition-api"
import { useVuetifyControl } from '@jsonforms/vue2-vuetify'
import CombinatorProperties from '@/renderers/components/CombinatorProperties.vue'

const controlRenderer = defineComponent({
  name: 'any-of-renderer',
  components: {
    DispatchRenderer,
    CombinatorProperties,
    VTabs,
    VTab,
    VTabsItems,
    VTabItem,
  },
  props: {
    ...rendererProps<ControlElement>(),
  },
  setup(props: RendererProps<ControlElement>) {
    const input = useJsonFormsAnyOfControl(props);
    const control = (input.control as any).value as typeof input.control;
    const selectedIndex = ref(control.indexOfFittingSchema || 0);
    return {
      isAdded: false,
      ...useVuetifyControl(input),
      selectedIndex,
    }
  },
  created() {
    this.isAdded = !!(this.control.data)
  },
  mounted() {
    // indexOfFittingSchema is only populated after mounted hook
    this.selectedIndex = this.control.indexOfFittingSchema || 0
  },
  computed: {
    subSchema(): JsonSchema {
      return resolveSubSchemas(
        this.control.schema,
        this.control.rootSchema,
        'anyOf'
      )
    },
    anyOfRenderInfos(): CombinatorSubSchemaRenderInfo[] {
      return createCombinatorRenderInfos(
        this.subSchema.anyOf!,
        this.control.rootSchema,
        'anyOf',
        this.control.uischema,
        this.control.path,
        this.control.uischemas
      );
    },
  },
  methods: {
    showForm() {
      this.isAdded = true
    },
    removeForm() {
      this.isAdded = false
      this.handleChange(this.control.path, undefined)
    }
  }
})

export default controlRenderer
export const anyOfRenderer: JsonFormsRendererRegistryEntry = {
  renderer: controlRenderer,
  tester: rankWith(3, isAnyOfControl),
}
</script>