<template>
  <div class="py-4">
    <fieldset v-if="control.visible"
      :data-id="control.schema.title.replaceAll(` `, ``)"
      :class="{
        ...styles.control.root, 
        'cz-fieldset': !isFlat,
        'is-borderless': isFlat,
      }">

      <template v-if="!isFlat">
        <legend v-if="control.schema.title" 
          @click="showForm()" :class="{ 'v-label--active': isAdded || !hasToggle }"
          class="v-label">{{ computedLabel }}</legend>

        <div v-if="hasToggle">
          <v-tooltip v-if="!isAdded" bottom transition="fade">
            <template v-slot:activator="{ on: onTooltip }">
              <v-btn icon color="primary"
                @click="showForm()" 
                :disabled="!control.enabled"
                :class="styles.arrayList.addButton"
                class="btn-add" 
                :aria-label="`Add to ${control.schema.title}`"
                v-on="onTooltip"
              >
                <v-icon>mdi-plus</v-icon>
              </v-btn>
            </template>
            {{ `Add ${control.schema.title}` }}
          </v-tooltip>

          <v-tooltip v-else bottom transition="fade">
            <template v-slot:activator="{ on: onTooltip }">
              <v-btn icon color="error"
                @click="removeForm()" 
                :class="styles.arrayList.addButton"
                :disabled="!control.enabled"
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
      </template>

      <template v-if="isAdded || !hasToggle">
        <combinator-properties
          :schema="control.schema"
          :path="path"
          combinatorKeyword="anyOf"
        />

        <template v-if="!isDropDown">
          <v-tabs v-model="selectedIndex">
            <v-tab
              @change="handleTabChange"
              :key="`${control.path}-${anyOfIndex}`"
              v-for="(anyOfRenderInfo, anyOfIndex) in anyOfRenderInfos"
            >
              {{ anyOfRenderInfo.label }}
            </v-tab>
          </v-tabs>

          <v-tabs-items v-model="selectedIndex">
            <v-tab-item
              v-for="(anyOfRenderInfo, anyOfIndex) in anyOfRenderInfos"
              :key="`${control.path}-${anyOfIndex}`"
              class="pt-8"
            >
              <dispatch-renderer
                v-if="selectedIndex === anyOfIndex"
                :schema="anyOfRenderInfo.schema"
                :uischema="anyOfRenderInfo.uischema"
                :path="control.path"
                :renderers="control.renderers"
                :cells="control.cells"
                :enabled="control.enabled"
              />
            </v-tab-item>
          </v-tabs-items>
        </template>

        <template v-else>
          <v-select
            @change="handleSelect"
            :items="anyOfRenderInfos"
            :label="title"
            :value="anyOfRenderInfos[selectedIndex]"
            :data-id="computedLabel.replaceAll(` `, ``)"
            :required="control.required"
            :error-messages="control.errors"
            :placeholder="appliedOptions.placeholder"
            :disabled="!control.enabled"
            :readonly="control.schema.readOnly"
            :hint="description"
            class="py-4"
            hide-details="auto"
            item-text="label"
            outlined
            dense
            persistent-hint
          >{{ currentLabel }}</v-select>
          
          <dispatch-renderer
            v-if="selectedIndex >= 0 && anyOfRenderInfos[selectedIndex]"
            :key="selectedIndex"
            :schema="anyOfRenderInfos[selectedIndex].schema"
            :uischema="anyOfRenderInfos[selectedIndex].uischema"
            :path="control.path"
            :renderers="control.renderers"
            :cells="control.cells"
            :enabled="control.enabled"
          />
        </template>
      </template>
    </fieldset>
    <div v-if="description" class="text--secondary text-body-1 mt-2 ml-2">{{ description }}</div>
    <div v-if="cleanedErrors" class="ml-2 mt-2 v-messages error--text">
      <v-divider v-if="isFlat" class="mb-4"></v-divider>
      {{ cleanedErrors }}
    </div>
  </div>
</template>

<script lang="ts">

import {
  ControlElement,
  createCombinatorRenderInfos,
  JsonFormsRendererRegistryEntry,
  rankWith,
  createDefaultValue,
  CombinatorSubSchemaRenderInfo,
  isAnyOfControl,
} from '@jsonforms/core';
import {
  DispatchRenderer,
  rendererProps,
  RendererProps,
  useJsonFormsAnyOfControl,
} from '@jsonforms/vue2';
import { defineComponent, ref } from 'vue'
import { useVuetifyControl } from '@/renderers/util/composition';
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
import CombinatorProperties from '@/renderers/components/CombinatorProperties.vue'

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
    const input = useJsonFormsAnyOfControl(props);
    const control = (input.control as any).value as typeof input.control;
    const tabData: {[key: number]: any } = {} // Dictionary to store form state between tab changes
    const selectedIndex = ref(control.indexOfFittingSchema || 0);
    const isAdded = ref(false);

    return {
      ...useVuetifyControl(input),
      isAdded,
      selectedIndex,
      tabData,
    };
  },
  created() {
    if (this.control.data) {
      this.isAdded = true
    }
  },
  mounted() {
    // indexOfFittingSchema is only populated after mounted hook
    this.selectedIndex = this.control.indexOfFittingSchema || 0
    this.annotateFittingSchema()  // Watchers are not setup yet, so we call it manually
  },
  computed: {
    anyOfRenderInfos(): CombinatorSubSchemaRenderInfo[] {
      const info = createCombinatorRenderInfos(
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.control.schema.anyOf!,
        this.control.rootSchema,
        'anyOf',
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
    hasToggle() {
      // @ts-ignore
      return !this.control.required && !this.control.schema.options?.flat
    },
    isFlat() {
      // @ts-ignore
      return this.control.schema.options?.flat
    },
    isDropDown(): boolean {
      // @ts-ignore
      return this.control.schema.options?.dropdown
    },
    title(): string {
      // @ts-ignore
      return this.control.schema?.options?.title 
      || this.control.schema.title
      || ''
    },
    description(): string {
      return this.control.description
      // @ts-ignore
      || this.control.schema?.options?.description 
      || this.appliedOptions.description
      || this.anyOfRenderInfos[this.selectedIndex].schema.description
      || ''
    },
    currentLabel(): string {
      return this.selectedIndex >= 0 
        ? this.anyOfRenderInfos[this.selectedIndex].label
        : ''
    },
    cleanedErrors() {
      // @ts-ignore
      return this.control.errors.replaceAll(`is a required property`, ``)
    },
  },
  watch: {
    selectedIndex(newIndex, oldIndex) {
      this.annotateFittingSchema()
    }
  },
  methods: {
    handleTabChange(): void {
      if (!this.control.enabled) {
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
          const schema = this.anyOfRenderInfos[this.selectedIndex].schema
          const val = schema.type === 'object' || schema.type === 'array'
            ? createDefaultValue(schema)
            : undefined
          
          // Only create default values for objects and arrays
          this.handleChange(
            this.control.path,
            val
          )
        }
      })
    },
    annotateFittingSchema() {
      this.anyOfRenderInfos.map((info, index) => {
        // @ts-ignore: used by error handling to figure out the used fitting schema
        info.schema.isFittingSchema = index === this.selectedIndex
      })
    },
    handleSelect(label: string) {
      this.$set(this.tabData, this.selectedIndex, this.control.data)  // Store form state before tab change
      this.selectedIndex = this.anyOfRenderInfos.findIndex((info: CombinatorSubSchemaRenderInfo) => info.label === label)
      
      if (this.selectedIndex === -1) {
        this.handleChange(
          this.control.path,
          undefined
        )
      }
      else if (this.tabData[this.selectedIndex]) {
        this.handleChange(this.control.path, this.tabData[this.selectedIndex])
      }
      else {
        this.handleChange(
          this.control.path,
          createDefaultValue(this.anyOfRenderInfos[this.selectedIndex].schema)
        )
      }
    },
    showForm() {
      if (this.control.enabled) {
        this.isAdded = true
      }
    },
    removeForm() {
      this.isAdded = false
      this.handleChange(this.control.path, undefined)
    },
  },
});

export default controlRenderer;

export const anyOfRenderer: JsonFormsRendererRegistryEntry = {
  renderer: controlRenderer,
  tester: rankWith(3, isAnyOfControl),
};
</script>