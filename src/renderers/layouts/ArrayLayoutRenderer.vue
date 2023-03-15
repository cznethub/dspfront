<template>
  <div class="py-4" :data-id="computedLabel.replaceAll(` `, ``)">
    <fieldset v-if="control.visible" class="cz-fieldset"
      :class="{'is-invalid': control.childErrors.length, ...styles.arrayList.root }" elevation="0">
      <legend v-if="computedLabel"
        @click="noData && control.enabled ? addButtonClick() : null"
        class="v-label" :class="styles.arrayList.label + (!noData ? ' v-label--active' : '')">
        {{ computedLabel }}
      </legend>

      <v-tooltip bottom transition="fade">
        <template v-slot:activator="{ on: onTooltip }">
          <v-btn icon color="primary"
            @click="addButtonClick()" 
            :class="styles.arrayList.addButton"
            class="btn-add" 
            :aria-label="`Add to ${control.label}`"
            v-on="onTooltip"
            :disabled="
              !control.enabled ||
              (appliedOptions.restrict &&
                maxItems !== undefined && control.data &&
                control.data.length >= maxItems)
            ">
            <v-icon>mdi-plus</v-icon>
          </v-btn>
        </template>
        {{ `Add to ${control.label}` }}
      </v-tooltip>

      <v-container v-if="!noData" class="pt-8" justify-space-around align-content-center>
        <v-row justify="center">
          <v-expansion-panels focusable v-model="currentlyExpanded" multiple>
            <v-expansion-panel
              v-for="(element, index) in control.data"
              :key="`${control.path}-${index}`"
              :class="styles.arrayList.item"
            >
              <v-expansion-panel-header :class="styles.arrayList.itemHeader">
                <v-container py-0>
                  <v-row>
                    <v-col v-if="!hideAvatar" align-self="center" px-0 class="flex-grow-0">
                      <v-chip aria-label="Index" color="primary">
                        <span class="primary--text text--lighten-5">{{ index + 1 }}</span>
                      </v-chip>
                    </v-col>

                    <v-col v-if="appliedOptions.elementLabelProp" align-self="center" justify-self="start" class="text-truncate flex-grow-1">
                      {{ getItemLabel(element) }}
                    </v-col>

                    <v-spacer></v-spacer>

                    <v-col
                      align-self="center"
                      class="flex-grow-0"
                      v-if="appliedOptions.showSortButtons"
                    >
                      <v-tooltip bottom>
                        <template v-slot:activator="{ on: onTooltip }">
                          <v-btn
                            v-on="onTooltip"
                            fab
                            text
                            elevation="0"
                            small
                            class="v-expansion-panel-header__icon"
                            aria-label="Move up"
                            :disabled="index <= 0 || !control.enabled"
                            :class="styles.arrayList.itemMoveUp"
                            @click.native="moveUpClick($event, index)"
                          >
                            <v-icon class="notranslate">mdi-arrow-up</v-icon>
                          </v-btn>
                        </template>
                        Move Up
                      </v-tooltip>
                    </v-col>
                    <v-col
                      align-self="center"
                      class="flex-grow-0"
                      v-if="appliedOptions.showSortButtons"
                    >
                      <v-tooltip bottom>
                        <template v-slot:activator="{ on: onTooltip }">
                          <v-btn
                            v-on="onTooltip"
                            fab
                            text
                            elevation="0"
                            small
                            class="v-expansion-panel-header__icon"
                            aria-label="Move down"
                            :disabled="
                              index >= control.data.length - 1 ||
                              !control.enabled
                            "
                            :class="styles.arrayList.itemMoveDown"
                            @click.native="moveDownClick($event, index)"
                          >
                            <v-icon class="notranslate">mdi-arrow-down</v-icon>
                          </v-btn>
                        </template>
                        Move Down
                      </v-tooltip>
                    </v-col>
                    <v-col align-self="center" class="flex-grow-0">
                      <v-tooltip bottom>
                        <template v-slot:activator="{ on: onTooltip }">
                          <v-btn
                            v-on="onTooltip"
                            fab
                            text
                            elevation="0"
                            small
                            class="v-expansion-panel-header__icon"
                            aria-label="Delete"
                            :class="styles.arrayList.itemDelete"
                            :disabled="
                              !control.enabled ||
                              (appliedOptions.restrict &&
                                arraySchema !== undefined &&
                                minItems !== undefined &&
                                control.data.length <= minItems)
                            "
                            @click.stop.native="suggestToDelete = index"
                          >
                            <v-icon class="notranslate">mdi-delete</v-icon>
                          </v-btn>
                        </template>
                        Delete
                      </v-tooltip>
                    </v-col>
                  </v-row>
                </v-container>
              </v-expansion-panel-header>
              <v-expansion-panel-content :class="styles.arrayList.itemContent" class="pa-0 pt-4">
                <dispatch-renderer
                  :schema="control.schema"
                  :uischema="foundUISchema"
                  :path="composePaths(control.path, `${index}`)"
                  :enabled="control.enabled && !isRequired(element)"
                  :renderers="control.renderers"
                  :cells="control.cells"
                />
              </v-expansion-panel-content>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-row>
      </v-container>
      <v-dialog
        :value="suggestToDelete !== null"
        max-width="600"
        @keydown.esc="suggestToDelete = null"
        @click:outside="suggestToDelete = null"
      >
        <v-card>
          <v-card-title class="text-h5">
            Delete {{ childLabelForIndex(suggestToDelete) || 'element' }}?
          </v-card-title>

          <v-card-text> The element will be deleted. </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>

            <v-btn text @click="suggestToDelete = null"> Cancel </v-btn>
            <v-btn
              text
              ref="confirm"
              @click="
                removeItemsClick([suggestToDelete]);
                suggestToDelete = null;
              "
            >
              Delete
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </fieldset>
    <div v-if="description" class="text--secondary text-body-1 ml-2">{{ description }}</div>
    <div v-if="cleanedErrors" class="ml-2 v-messages error--text">
      {{ cleanedErrors }}
    </div>
  </div>
</template>

<script lang="ts">
import {
  JsonFormsRendererRegistryEntry,
  ControlElement,
  rankWith,
  isObjectArrayWithNesting,
  composePaths,
  createDefaultValue,
  UISchemaElement,
  findUISchema,
  Resolve,
  JsonSchema,
  getControlPath,
  or,
  isObjectArrayControl
} from '@jsonforms/core';
import { defineComponent } from 'vue'
import {
  DispatchRenderer,
  rendererProps,
  useJsonFormsArrayControl,
  RendererProps,
  useJsonFormsControl,
} from '@jsonforms/vue2';
import { useNested, useVuetifyArrayControl, useVuetifyControl } from '@/renderers/util/composition';
import {
  VCard,
  VCardActions,
  VCardTitle,
  VCardText,
  VDialog,
  VRow,
  VCol,
  VContainer,
  VToolbar,
  VToolbarTitle,
  VTooltip,
  VIcon,
  VBtn,
  VAvatar,
  VSpacer,
  VExpansionPanels,
  VExpansionPanel,
  VExpansionPanelHeader,
  VExpansionPanelContent,
} from 'vuetify/lib';
import ValidationBadge from '@/renderers/controls/components/ValidationBadge.vue';
import ValidationIcon from '@/renderers/controls/components/ValidationIcon.vue';
import { ErrorObject } from 'ajv';
import { ref } from 'vue';
import { isEqual } from 'lodash';

const controlRenderer = defineComponent({
  name: 'array-layout-renderer',
  components: {
    DispatchRenderer,
    VCard,
    VCardActions,
    VCardTitle,
    VCardText,
    VAvatar,
    VDialog,
    VRow,
    VCol,
    VToolbar,
    VToolbarTitle,
    VTooltip,
    VIcon,
    VBtn,
    VSpacer,
    VExpansionPanels,
    VExpansionPanel,
    VExpansionPanelHeader,
    VExpansionPanelContent,
    VContainer,
    ValidationIcon,
    ValidationBadge,
  },
  props: {
    ...rendererProps<ControlElement>(),
  },
  setup(props: RendererProps<ControlElement>) {
    const control = {
      ...useVuetifyControl(
        useJsonFormsControl(props),
        (value) => value || undefined
      ),  // Needed for handleChange function
      ...useVuetifyArrayControl(useJsonFormsArrayControl(props)),
    };

    const currentlyExpanded: number[] = []
    const suggestToDelete = ref<null | number>(null);
    // indicate to our child renderers that we are increasing the "nested" level
    useNested('array');
    return { ...control, currentlyExpanded, suggestToDelete };
  },
  created() {
    // @ts-ignore
    const requiredItems = this.control.schema.contains?.enum || []

    requiredItems.map(item => {
      if (!this.control.data) {
        this.handleChange(this.control.path, undefined)
      }
      // We most use isEqual to compare objects instead of Arra.includes
      const isIncluded = this.control.data?.some(existingItem => isEqual(item, existingItem))
      if (!isIncluded) {
        this.addItem(
          this.control.path,
          item
        )()
      }
    })

    if (this.control.schema.default && !this.control.data) {
      this.control.schema.default.map(item => {
        this.addItem(
          this.control.path,
          item
        )()
      })
    }

    // Expand existing items
    if (this.control.data) {
      this.currentlyExpanded = this.control.data.map((item, index) => index)
    }
  },
  computed: {
    noData(): boolean {
      return !this.control.data || this.control.data.length === 0
    },
    foundUISchema(): UISchemaElement {
      return findUISchema(
        this.control.uischemas,
        this.control.schema,
        this.control.uischema.scope,
        this.control.path,
        undefined,
        this.control.uischema,
        this.control.rootSchema
      )
    },
    arraySchema(): JsonSchema | undefined {
      return Resolve.schema(
        this.control.rootSchema,
        this.control.uischema.scope,
        this.control.rootSchema
      )
    },
    hideAvatar(): boolean {
      // @ts-ignore
      return !!this.appliedOptions.hideAvatar;
    },
    cleanedErrors() {
      // @ts-ignore
      return this.control.errors.replaceAll(`is a required property`, ``)
    },
    maxItems() {
      // @ts-ignore
      return this.control.schema.maxItems || this.arraySchema?.maxItems
    },
    minItems() {
      // @ts-ignore
      return this.control.schema.minItems || this.arraySchema?.minItems
    },
    description(): string {
      return this.control.description || this.appliedOptions.description || ''
    },
  },
  methods: {
    composePaths,
    createDefaultValue,
    addButtonClick() {
      this.addItem(
        this.control.path,
        createDefaultValue(this.control.schema)
      )();
      // @ts-ignore
      if (!this.appliedOptions.collapseNewItems && this.control.data?.length) {
        this.currentlyExpanded.push(this.control.data.length - 1);
      }
    },
    moveUpClick(event: Event, toMove: number): void {
      event.stopPropagation();
      this.moveUp?.(this.control.path, toMove)();
    },
    moveDownClick(event: Event, toMove: number): void {
      event.stopPropagation();
      this.moveDown?.(this.control.path, toMove)();
    },
    removeItemsClick(toDelete: number[]): void {
      this.removeItems?.(this.control.path, toDelete)();
      if (this.control.data.length === 0) {
        this.handleChange(this.control.path, undefined)
      }
    },
    childErrors(index: number): ErrorObject[] {
      return this.control.childErrors.filter((e) => {
        const errorDataPath = getControlPath(e);
        return errorDataPath.startsWith(
          this.composePaths(this.control.path, `${index}`)
        );
      });
    },
    // TODO: currently no way to propagate this to array elements.
    isRequired(item) {
      // @ts-ignore
      return this.control.schema.contains?.enum?.some(requiredItem => isEqual(item, requiredItem))
    },
    getItemLabel(element) {
      // @ts-ignore
      if (Array.isArray(this.appliedOptions.elementLabelProp)) {
        // @ts-ignore
        return this.appliedOptions.elementLabelProp
          .map(prop => element[prop])
          .join(" ")
      }
      else {
        // @ts-ignore
        return element[this.appliedOptions.elementLabelProp]
      }
    }
  },
});

export default controlRenderer;

const useTableLayout = (uiSchema) => {
  return false  // TODO: table layout disabled until issue with asterik is solved
  // return uiSchema.options?.useTableLayout
}

const useArrayLayout = (uiSchema) => {
  return uiSchema.options?.useArrayLayout
}

export const arrayLayoutRenderer: JsonFormsRendererRegistryEntry = {
  renderer: controlRenderer,
  tester: rankWith(4, or(isObjectArrayControl, isObjectArrayWithNesting, useArrayLayout)),
};
</script>

<style scoped>
.notranslate {
  transform: none !important;
}
</style>