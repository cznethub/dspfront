<template>
  <div class="py-4">
    <fieldset v-if="control.visible" class="cz-fieldset" 
      :class="{'is-invalid': control.childErrors.length }" 
      :data-id="computedLabel.replaceAll(` `, ``)"
    >
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
                arraySchema !== undefined &&
                arraySchema.maxItems !== undefined &&
                control.data.length >= arraySchema.maxItems)
            ">
            <v-icon>mdi-plus</v-icon>
          </v-btn>
        </template>
        {{ `Add to ${control.label}` }}
      </v-tooltip>
    
      <v-card v-if="control.visible && !noData" :class="styles.arrayList.root" elevation="0">
        <v-container justify-space-around align-content-center>
          <v-row justify="center">
            <v-simple-table class="array-container flex">
              <thead v-if="control.schema.type === 'object'">
                <tr>
                  <th
                    v-for="(prop, index) in getValidColumnProps(control.schema)"
                    :key="`${control.path}-header-${index}`"
                    scope="col"
                    class="text-body-1"
                  >
                    {{ title(prop) }}
                  </th>
                  <th
                    v-if="control.enabled"
                    :class="
                      appliedOptions.showSortButtons
                        ? 'fixed-cell'
                        : 'fixed-cell-small'
                    "
                    scope="col"
                  ></th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(element, index) in control.data"
                  :key="`${control.path}-${index}`"
                  :class="styles.arrayList.item"
                >
                  <td
                    v-for="propName in getValidColumnProps(control.schema)"
                    :key="
                      composePaths(
                        composePaths(control.path, `${index}`),
                        propName
                      )
                    "
                  >
                    <dispatch-renderer
                      :schema="control.schema"
                      :uischema="resolveUiSchema(propName)"
                      :path="composePaths(control.path, `${index}`)"
                      :enabled="control.enabled && !isRequired(element)"
                      :renderers="control.renderers"
                      :cells="control.cells"
                    />
                  </td>
                  <td
                    v-if="control.enabled"
                    :class="
                      appliedOptions.showSortButtons
                        ? 'fixed-cell'
                        : 'fixed-cell-small'
                    "
                  >
                    <v-tooltip bottom>
                      <template v-slot:activator="{ on: onTooltip }">
                        <v-btn
                          v-on="onTooltip"
                          v-if="appliedOptions.showSortButtons"
                          fab
                          text
                          elevation="0"
                          small
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
                    <v-tooltip bottom>
                      <template v-slot:activator="{ on: onTooltip }">
                        <v-btn
                          v-on="onTooltip"
                          v-if="appliedOptions.showSortButtons"
                          fab
                          text
                          elevation="0"
                          small
                          aria-label="Move down"
                          :disabled="
                            index >= control.data.length - 1 || !control.enabled
                          "
                          :class="styles.arrayList.itemMoveDown"
                          @click.native="moveDownClick($event, index)"
                        >
                          <v-icon class="notranslate">mdi-arrow-down</v-icon>
                        </v-btn>
                      </template>
                      Move Down
                    </v-tooltip>
                    <v-tooltip bottom>
                      <template v-slot:activator="{ on: onTooltip }">
                        <v-btn
                          v-on="onTooltip"
                          fab
                          text
                          elevation="0"
                          small
                          aria-label="Delete"
                          :class="styles.arrayList.itemDelete"
                          :disabled="
                            !control.enabled ||
                            (appliedOptions.restrict &&
                              arraySchema !== undefined &&
                              arraySchema.minItems !== undefined &&
                              control.data.length <= arraySchema.minItems)
                          "
                          @click.native="removeItemsClick($event, [index])"
                        >
                          <v-icon class="notranslate">mdi-delete</v-icon>
                        </v-btn>
                      </template>
                      Delete
                    </v-tooltip>
                  </td>
                </tr>
              </tbody>
            </v-simple-table>
          </v-row>
        </v-container>
      </v-card>
    </fieldset>
    <div v-if="description" class="text--secondary text-body-1 ml-2">{{ description }}</div>
    <div v-if="cleanedErrors" class="ml-2 v-messages error--text">
      {{ cleanedErrors }}
    </div>
  </div>
</template>

<script lang="ts">
import {
  isObjectArrayControl,
  isPrimitiveArrayControl,
  JsonFormsRendererRegistryEntry,
  or,
  rankWith,
  composePaths,
  createDefaultValue,
  ControlElement,
  JsonSchema,
  Resolve,
  and
} from '@jsonforms/core';
import startCase from 'lodash/startCase';
import { defineComponent } from 'vue'
import {
  DispatchCell,
  DispatchRenderer,
  rendererProps,
  useJsonFormsArrayControl,
  RendererProps,
  useJsonFormsControl,
} from '@jsonforms/vue2';
import { useVuetifyArrayControl, useVuetifyControl } from '@/renderers/util/composition';
import {
  VCard,
  VCardTitle,
  VCardText,
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
  VSimpleTable,
} from 'vuetify/lib';
import ValidationBadge from '@/renderers/controls/components/ValidationBadge.vue';
import ValidationIcon from '@/renderers/controls/components/ValidationIcon.vue';
import { isEqual } from 'lodash';

const controlRenderer = defineComponent({
  name: 'array-control-renderer',
  components: {
    DispatchCell,
    DispatchRenderer,
    VCard,
    VCardTitle,
    VCardText,
    VAvatar,
    VRow,
    VCol,
    VToolbar,
    VToolbarTitle,
    VTooltip,
    VIcon,
    VBtn,
    VSpacer,
    VContainer,
    ValidationIcon,
    ValidationBadge,
    VSimpleTable,
  },
  props: {
    ...rendererProps<ControlElement>(),
  },
  setup(props: RendererProps<ControlElement>) {
    return {
      ...useVuetifyControl(
        useJsonFormsControl(props),
        (value) => value || undefined
      ),  // Needed for handleChange function
      ...useVuetifyArrayControl(useJsonFormsArrayControl(props))
    };
  },
  computed: {
    arraySchema(): JsonSchema | undefined {
      return Resolve.schema(
        this.control.rootSchema,
        this.control.uischema.scope,
        this.control.rootSchema
      );
    },
    noData(): boolean {
      return !this.control.data || this.control.data.length === 0;
    },
    cleanedErrors() {
      // @ts-ignore
      return this.control.errors.replaceAll(`is a required property`, ``)
    },
    description(): string {
      return this.control.description || this.appliedOptions.description || ''
    },
  },
  created() {
    // @ts-ignore
    const requiredItems = this.control.schema.contains?.enum || []
    
    requiredItems.map(item => {
      if (!this.control.data) {
        this.control.data = []
      }
      // We most use isEqual to compare objects instead of Arra.includes
      const isIncluded = this.control.data.some(existingItem => isEqual(item, existingItem))
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
  },
  methods: {
    composePaths,
    createDefaultValue,
    addButtonClick() {
      this.addItem(
        this.control.path,
        createDefaultValue(this.control.schema)
      )();
    },
    moveUpClick(event: Event, toMove: number): void {
      event.stopPropagation();
      this.moveUp?.(this.control.path, toMove)();
    },
    moveDownClick(event: Event, toMove: number): void {
      event.stopPropagation();
      this.moveDown?.(this.control.path, toMove)();
    },
    removeItemsClick(event: Event, toDelete: number[]): void {
      event.stopPropagation();
      this.removeItems?.(this.control.path, toDelete)();
      if (this.control.data.length === 0) {
        this.handleChange(this.control.path, undefined)
      }
    },
    getValidColumnProps(scopedSchema: JsonSchema) {
      if (
        scopedSchema.type === 'object' &&
        typeof scopedSchema.properties === 'object'
      ) {
        return Object.keys(scopedSchema.properties).filter(
          (prop) => {
            const property = scopedSchema.properties![prop]
            return property.type !== 'array'
              // @ts-ignore
              && !property.options?.hidden 
          }
        );
      }
      // primitives
      return [''];
    },
    title(prop: string) {
      return this.control.schema.properties?.[prop]?.title ?? startCase(prop);
    },
    resolveUiSchema(propName: string) {
      return this.control.schema.properties
        ? this.controlWithoutLabel(`#/properties/${propName}`)
        : this.controlWithoutLabel('#');
    },
    controlWithoutLabel(scope: string): ControlElement {
      return { type: 'Control', scope: scope, label: false };
    },
    // TODO: currently no way to propagate this to array elements.
    isRequired(item) {
      // @ts-ignore
      return this.control.schema.contains?.enum?.some(requiredItem => isEqual(item, requiredItem))
    }
  },
});

export default controlRenderer;

const useTableLayout = (uiSchema) => {
  return uiSchema.options?.useTableLayout
}

export const arrayControlRenderer: JsonFormsRendererRegistryEntry = {
  renderer: controlRenderer,
  tester: rankWith(3, or(isPrimitiveArrayControl, and(isObjectArrayControl, useTableLayout))),
};
</script>

<style lang="scss" scoped>
.fixed-cell {
  width: 150px;
  height: 50px;
  padding-left: 0 !important;
  padding-right: 0 !important;
  text-align: center;
}

.fixed-cell-small {
  width: 50px;
  height: 50px;
  padding-left: 0 !important;
  padding-right: 0 !important;
  text-align: center;
}

.array-container tbody tr td {
  border-bottom: none !important;
}

.array-container tbody tr td .container {
  padding: 0;
  margin: 0;
}

::v-deep .array-container .v-label {
  background-color: transparent !important;
}
</style>