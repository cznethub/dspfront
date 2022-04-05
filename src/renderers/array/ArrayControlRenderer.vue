<template>
  <div class="mb-8" :data-id="computedLabel.replaceAll(` `, ``)">
    <fieldset v-if="control.visible" class="cz-fieldset" :class="{'is-invalid': tooltipMessages.length }">
      <legend v-if="computedLabel"
        @click="noData ? addButtonClick() : null"
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

      <div v-if="control.data && control.data.length" class="list-elements-container mt-4 pb-2">
        <array-list-element
          v-for="(item, index) of control.data"
          :data-id="`array-item-${index}`"
          @deleted="afterDelete"
          :isRequired="isRequired(item)"
          :key="index"
          :styles="styles"
          :moveUp="moveUp(control.path, index)"
          :moveDown="moveDown(control.path, index)"
          :delete="removeItems(control.path, [index])"
          :moveUpEnabled="index > 0"
          :moveDownEnabled="index < control.data.length - 1"
          :label="childLabelForIndex(index)"
          class="list-complete-item mt-2"
        >
          <dispatch-renderer
            :schema="control.schema"
            :uischema="childUiSchema"
            :path="composePaths(control.path, `${index}`)"
            :enabled="control.enabled && !isRequired(item)"
            :renderers="control.renderers"
            :cells="control.cells"
          />
        </array-list-element>
      </div>
      <!-- Layout with drag and drop: -->
      <!-- <drop-list v-if="control.data && control.data.length" name="list-complete" class="list-elements-container mt-4 pb-2" 
        :items="control.data || []"
        @reorder="reorderElements($event.from, $event.to)"
      >
        <template v-slot:item="{ index }">
          <drag class="item" :key="index">
            <array-list-element
              class="list-complete-item mt-2"
              :styles="styles"
              :moveUp="moveUp(control.path, index)"
              :moveDown="moveDown(control.path, index)"
              :delete="removeItems(control.path, [index])"
              :moveUpEnabled="index > 0"
              :moveDownEnabled="index < control.data.length - 1"
              :label="childLabelForIndex(index)"
            >
              <dispatch-renderer
                :schema="control.schema"
                :uischema="childUiSchema"
                :path="composePaths(control.path, `${index}`)"
                :enabled="control.enabled"
                :renderers="control.renderers"
                :cells="control.cells"
              />
            </array-list-element>
          </drag>
        </template>

        <template v-slot:feedback="{data}">
          <div class="item feedback" :key="data">{{data}}</div>
        </template>
      </drop-list> -->
    </fieldset>
    <div class="text--secondary text-caption ml-2">{{ control.schema.description }}</div>
    <div v-if="control.errors" class="ml-2 v-messages error--text" :class="styles.control.error">
      {{ control.errors }}
    </div>
  </div>
</template>

<script lang="ts">
import {
  JsonFormsRendererRegistryEntry,
  rankWith,
  composePaths,
  createDefaultValue,
  ControlElement,
  JsonSchema,
  Resolve,
  schemaTypeIs,
  createLabelDescriptionFrom
} from '@jsonforms/core';
import { defineComponent } from "@vue/composition-api"
import {
  DispatchRenderer,
  rendererProps,
  useJsonFormsArrayControl,
  RendererProps,
  useJsonFormsControl,
} from '@jsonforms/vue2'
import { useVuetifyArrayControl } from '@jsonforms/vue2-vuetify'
import { useVanillaArrayControl } from "@jsonforms/vue2-vanilla"
import { Drag, Drop, DropList } from 'vue-easy-dnd'
import { ErrorObject } from 'ajv';
import { createControlElement } from '@jsonforms/core/lib/generators/uischema'
import { useVuetifyControl } from '@jsonforms/vue2-vuetify'
import ArrayListElement from './ArrayListElement.vue'
import findIndex from 'lodash/findIndex'

const isEqual = require('lodash.isequal')

const controlRenderer = defineComponent({
  name: 'array-control-renderer',
  components: {
    DispatchRenderer,
    ArrayListElement,
    Drop, 
    DropList, 
    Drag
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
      ...useVuetifyArrayControl(
        useVanillaArrayControl(
          useJsonFormsArrayControl(props),
        ),
      )
    }
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
  computed: {
    arraySchema(): JsonSchema | undefined {
      return Resolve.schema(
        this.control.rootSchema,
        this.control.uischema.scope,
        this.control.rootSchema
      )
    },
    noData(): boolean {
      return !this.control.data || this.control.data.length === 0
    },
    tooltipMessages(): string[] {
      const error: {
        instancePath: string;
        schemaPath: string;
        labels: (string | undefined)[];
        message: string;
      }[] = [];

      for (const e of this.control.childErrors) {
        const errorObject = e as ErrorObject;
        const index = findIndex(error, { schemaPath: errorObject.schemaPath });
        if (errorObject.message) {
          if (index == -1) {
            error.push({
              schemaPath: errorObject.schemaPath,
              instancePath: errorObject.dataPath,
              labels: [
                createLabelDescriptionFrom(
                  createControlElement(errorObject.dataPath),
                  errorObject.schema as JsonSchema
                ).text,
              ],
              message: errorObject.message,
            })
          } else {
            error[index].labels.push(
              createLabelDescriptionFrom(
                createControlElement(errorObject.dataPath),
                errorObject.schema as JsonSchema
              ).text
            )
          }
        }
      }

      return error.map((v) => v.labels.join(',') + ': ' + v.message);
    }
  },
  methods: {
    composePaths,
    createDefaultValue,
    addButtonClick() {
      this.addItem(
        this.control.path,
        createDefaultValue(this.control.schema)
      )()
    },
    reorderElements(index, newIndex) {
      if (newIndex < 0 || newIndex >= this.control.data.length) {
          return
      } // Already at the top or bottom.
      this.control.data.splice(newIndex, 0, this.control.data.splice(index, 1)[0])
    },
    // TODO: currently no way to propagate this to array elements.
    isRequired(item) {
      // @ts-ignore
      return this.control.schema.contains?.enum?.includes(item)
    },
    afterDelete() {
      if (this.control.data.length === 0) {
        // TODO: find how to import this
        this.handleChange(this.control.path, undefined)
      }
    }
  }
})

export default controlRenderer

export const arrayControlRenderer: JsonFormsRendererRegistryEntry = {
  renderer: controlRenderer,
  tester: rankWith(3, schemaTypeIs('array'))
}
</script>

<style lang="scss" scoped>
  .list-elements-container {
    ::v-deep .v-card {
      margin: 0;
    }

    ::v-deep .list-complete-item > .v-card__text {
      overflow: auto;
      resize: vertical;
    }
  }

  // .list-complete-item {
  //   transition: all 0.35s ease;
  // }

  // .list-complete-enter,
  // .list-complete-leave-to {
  //   opacity: 0;
  // }

  // .list-complete-leave-active {
  //   position: absolute;
  // }

  .list-title {
    position: absolute;
    top: -2.3rem;
    width: 100%;

    & > label {
      color: rgba(0,0,0,.6);
      background: #FFF;
      transform: scale(0.75);
      font-weight: normal;
    }
  }

  .v-alert {
    border-color: #9e9e9e !important;
  }
</style>