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
          combinatorKeyword="oneOf"
          :path="path"
        />

        <v-tabs v-model="selectedIndex">
          <v-tab
            @change="handleTabChange"
            v-for="(oneOfRenderInfo, oneOfIndex) in oneOfRenderInfos"
            :key="`${control.path}-${oneOfIndex}`"
          >
            {{ oneOfRenderInfo.label }}
          </v-tab>
        </v-tabs>

        <v-tabs-items v-model="selectedIndex">
          <v-tab-item
            v-for="(oneOfRenderInfo, oneOfIndex) in oneOfRenderInfos"
            :key="`${control.path}-${oneOfIndex}`"
          >
            <dispatch-renderer
              v-if="selectedIndex === oneOfIndex"
              :schema="oneOfRenderInfo.schema"
              :uischema="oneOfRenderInfo.uischema"
              :path="control.path"
              :renderers="control.renderers"
              :cells="control.cells"
            />
          </v-tab-item>
        </v-tabs-items>
      </template>
    </fieldset>
  </div>
</template>

<script lang="ts">

import {
  ControlElement,
  createCombinatorRenderInfos,
  isOneOfControl,
  JsonFormsRendererRegistryEntry,
  rankWith,
  createDefaultValue,
  resolveSubSchemas,
  JsonFormsSubStates,
  getConfig,
  getSchema,
  getData,
  ControlProps,
  JsonSchema,
  CombinatorSubSchemaRenderInfo,
  JsonFormsState,
  UISchemaElement,
  hasEnableRule,
  isEnabled,
  getAjv,
} from '@jsonforms/core';
import {
  DispatchRenderer,
  rendererProps,
  RendererProps,
  useJsonFormsOneOfControl,
} from '@jsonforms/vue2';
import {
  VDialog,
  VCard,
  VCardTitle,
  VCardText,
  VCardActions,
  VSpacer,
  VBtn,
  VTabs,
  VTab,
  VTabsItems,
  VTabItem,
} from 'vuetify/lib';
import { computed, defineComponent, inject, ref } from "@vue/composition-api"
import CombinatorProperties from '@/renderers/components/CombinatorProperties.vue'
import { useVuetifyControl } from '@jsonforms/vue2-vuetify'

const isInherentlyEnabled = (
  state: JsonFormsState,
  ownProps: any,
  uischema: UISchemaElement,
  schema: JsonSchema & { readOnly?: boolean } | undefined,
  rootData: any,
  config: any
) => {
  if (state?.jsonforms?.readonly) {
    return false;
  }
  if (uischema && hasEnableRule(uischema)) {
    return isEnabled(uischema, rootData, ownProps?.path, getAjv(state));
  }
  if (typeof uischema?.options?.readonly === 'boolean') {
    return !uischema.options.readonly;
  }
  if (typeof uischema?.options?.readOnly === 'boolean') {
    return !uischema.options.readOnly;
  }
  if (typeof config?.readonly === 'boolean') {
    return !config.readonly;
  }
  if (typeof config?.readOnly === 'boolean') {
    return !config.readOnly;
  }
  if (schema?.readOnly === true) {
    return false;
  }
  if (typeof ownProps?.enabled === 'boolean') {
    return ownProps.enabled;
  }
  return true;
};


// TODO: currently mapStateToOneOfProps in core does not provide control enabled property
// currently used in handleTabChange when switching to the next tab and data needs to be cleared but no data changed should happen
// for example when the JsonForm is in read only state no data should be modified
const isControlEnabled = (
  ownProps: ControlProps,
  jsonforms: JsonFormsSubStates
): boolean => {
  const state = { jsonforms };
  const config = getConfig(state);
  const rootData = getData(state);
  const { uischema } = ownProps;

  const rootSchema = getSchema(state);

  return isInherentlyEnabled(
    state,
    ownProps,
    uischema,
    ownProps.schema || rootSchema,
    rootData,
    config
  );
};

const controlRenderer = defineComponent({
  name: 'one-of-renderer',
  components: {
    DispatchRenderer,
    CombinatorProperties,
    VDialog,
    VCard,
    VCardTitle,
    VCardText,
    VCardActions,
    VSpacer,
    VBtn,
    VTabs,
    VTab,
    VTabsItems,
    VTabItem,
  },
  props: {
    ...rendererProps<ControlElement>(),
  },
  setup(props: RendererProps<ControlElement>) {
    const input = useJsonFormsOneOfControl(props);
    const control = (input.control as any).value as typeof input.control;
    const tabData: {[key: number]: any } = {} // Dictionary to store form state between tab changes
    const selectedIndex = ref(control.indexOfFittingSchema || 0);

    // TODO: once the enabled property is mapped by JsonForms core we can remove this jsonforms and controlEnabled variables
    const jsonforms = inject<JsonFormsSubStates>('jsonforms');
    if (!jsonforms) {
      throw new Error(
        "'jsonforms' couldn't be injected. Are you within JSON Forms?"
      );
    }
    const controlEnabled = computed(() =>
      isControlEnabled(props as ControlProps, jsonforms)
    );

    return {
      ...useVuetifyControl(input),
      isAdded: false,
      selectedIndex,
      tabData,
      controlEnabled,
    };
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
        'oneOf'
      );
    },
    oneOfRenderInfos(): CombinatorSubSchemaRenderInfo[] {
      return createCombinatorRenderInfos(
        this.subSchema.oneOf!,
        this.control.rootSchema,
        'oneOf',
        this.control.uischema,
        this.control.path,
        this.control.uischemas
      );
    },
  },
  methods: {
    handleTabChange(): void {
      if (!this.controlEnabled) {
        return
      }

      this.$set(this.tabData, this.selectedIndex, this.control.data)  // Store form state before tab change
      this.$nextTick(() => {
        // Tab has changed
        // If we had form data stored, restore it. Otherwise create default value.
        if (this.tabData[this.selectedIndex]) {
          this.handleChange(this.control.path, this.tabData[this.selectedIndex])
        }
        else {
          this.handleChange(
            this.path,
            createDefaultValue(this.control.schema.oneOf![this.selectedIndex])
          )
        }
      })
    },
    showForm() {
      this.isAdded = true
    },
    removeForm() {
      this.isAdded = false
      this.handleChange(this.control.path, undefined)
    }
  },
});

export default controlRenderer;

export const oneOfRenderer: JsonFormsRendererRegistryEntry = {
  renderer: controlRenderer,
  tester: rankWith(3, isOneOfControl),
};
</script>