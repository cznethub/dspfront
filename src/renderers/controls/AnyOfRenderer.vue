<template>
  <div class="my-4">
    <fieldset v-if="control.visible"
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
          <div>
            <v-select
              :items="anyOfRenderInfos"
              :label="control.schema.title"
              :value="anyOfRenderInfos[selectedIndex]"
              :data-id="computedLabel.replaceAll(` `, ``)"
              :hint="control.description"
              :required="control.required"
              :error-messages="control.errors"
              :placeholder="appliedOptions.placeholder"
              @change="handleSelect"
              class="py-4"
              hide-details="auto"
              item-text="label"
              :disabled="!control.enabled"
              :readonly="control.schema.readOnly"
              outlined
              dense
              persistent-hint
            >{{ anyOfRenderInfos[selectedIndex].label }}</v-select>

            <dispatch-renderer
              v-if="anyOfRenderInfos[selectedIndex]"
              :key="selectedIndex"
              :schema="anyOfRenderInfos[selectedIndex].schema"
              :uischema="anyOfRenderInfos[selectedIndex].uischema"
              :path="control.path"
              :renderers="control.renderers"
              :cells="control.cells"
              :enabled="control.enabled"
            />
          </div>
        </template>
      </template>
    </fieldset>
    <div v-if="control.schema.description" class="text--secondary text-body-1 ml-2">{{ control.schema.description }}</div>
    <div v-if="control.errors" class="ml-2 v-messages error--text" :class="styles.control.error">
      {{ control.errors }}
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
import { defineComponent, ref } from "@vue/composition-api"
import { useVuetifyControl } from '@jsonforms/vue2-vuetify'
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

    return {
      ...useVuetifyControl(input),
      isAdded: false,
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
  },
  computed: {
    anyOfRenderInfos(): CombinatorSubSchemaRenderInfo[] {
      return createCombinatorRenderInfos(
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.control.schema.anyOf!,
        this.control.rootSchema,
        'anyOf',
        this.control.uischema,
        this.control.path,
        this.control.uischemas
      );
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
          this.handleChange(
            this.path,
            createDefaultValue(this.anyOfRenderInfos[this.selectedIndex].schema)
          )
        }
      })
    },
    handleSelect(label: string) {
      this.$set(this.tabData, this.selectedIndex, this.control.data)  // Store form state before tab change
      this.selectedIndex = this.anyOfRenderInfos.findIndex((info: CombinatorSubSchemaRenderInfo) => info.label === label)

      if (this.tabData[this.selectedIndex]) {
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
      this.isAdded = true
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