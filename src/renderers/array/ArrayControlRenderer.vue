<template>
  <fieldset v-if="control.visible" :class="styles.arrayList.root" class="cz-fieldset mb-8">
    <legend v-if="computedLabel"
      @click="noData ? addButtonClick() : null"
      class="v-label" :class="styles.arrayList.label + (!noData ? ' v-label--active' : '')">
      {{ computedLabel }}
    </legend>
    <v-tooltip bottom>
      <template v-slot:activator="{ on: onTooltip }">
        <v-btn icon color="primary"
          @click="addButtonClick" 
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
    <div>
      <drop-list name="list-complete" class="list-elements-container mt-4" 
        :items="control.data || []"
        @reorder="reorderElements($event.from, $event.to)"
      >
        <template v-slot:item="{ index }">
          <drag class="item" :key="index">
            <array-list-element
              class="list-complete-item"
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
      </drop-list>
    </div>
  </fieldset>
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
  schemaTypeIs
} from '@jsonforms/core';
import { defineComponent } from "@vue/composition-api"
import {
  DispatchRenderer,
  rendererProps,
  useJsonFormsArrayControl,
  RendererProps,
} from '@jsonforms/vue2'
import { useVuetifyArrayControl } from '@jsonforms/vue2-vuetify'
import { useVanillaArrayControl } from "@jsonforms/vue2-vanilla"
import { Drag, Drop, DropList } from 'vue-easy-dnd'
import ArrayListElement from './ArrayListElement.vue'

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
    return useVuetifyArrayControl(
      useVanillaArrayControl(
        useJsonFormsArrayControl(props)
      )
    )
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
      return !this.control.data || this.control.data.length === 0;
    },
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
  },
})
export default controlRenderer;
export const arrayControlRenderer: JsonFormsRendererRegistryEntry = {
  renderer: controlRenderer,
  tester: rankWith(3, schemaTypeIs('array'))
}
</script>

<style lang="scss" scoped>
  .list-elements-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(25rem, 1fr));
    gap: 2rem;

    ::v-deep .v-card {
      margin: 0;
    }
  }

  .list-complete-item {
    transition: all 0.35s ease;
  }

  .list-complete-enter,
  .list-complete-leave-to {
    opacity: 0;
  }

  .list-complete-leave-active {
    // position: absolute;
  }

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