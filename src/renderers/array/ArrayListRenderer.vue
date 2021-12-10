<template>
  <div v-if="control.visible" class="cz-field">
    <div class="md-layout md-alignment-bottom-space-between has-space-bottom">
      <div class="md-subheading">{{ control.label }}</div>

      <v-btn class="md-fab md-raised md-accent md-mini" @click="addButtonClick" :class="styles.arrayList.addButton">
        <v-icon>add</v-icon>
      </v-btn>
    </div>

    <hr>

    <drop-list name="list-complete" class="list-elements-container" 
      :items="control.data || []"
      @reorder="reorderElements($event.from, $event.to)"
    >
      <template v-slot:item="{ item, index }">
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

    <div v-if="noData" class="md-caption">
      Click on the '+' button above to add items.
    </div>
  </div>
</template>

<script lang="ts">
import {
  composePaths,
  createDefaultValue,
  JsonFormsRendererRegistryEntry,
  rankWith,
  ControlElement,
  schemaTypeIs
} from '@jsonforms/core'
import { defineComponent } from '@vue/composition-api'
import {
  DispatchRenderer,
  rendererProps,
  useJsonFormsArrayControl,
  RendererProps
} from '@jsonforms/vue2'
import { useVanillaArrayControl } from "@jsonforms/vue2-vanilla"
import { Drag, Drop, DropList } from 'vue-easy-dnd'
import ArrayListElement from './ArrayListElement.vue'

const controlRenderer = defineComponent({
  name: 'array-list-renderer',
  components: {
    ArrayListElement,
    DispatchRenderer,
    Drop, DropList, Drag
  },
  props: {
    ...rendererProps<ControlElement>()
  },
  setup(props: RendererProps<ControlElement>) {
    return useVanillaArrayControl(useJsonFormsArrayControl(props))
  },
  computed: {
    noData(): boolean {
      return !this.control.data || this.control.data.length === 0
    }
  },
  // created() {
  // },
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
  }
})

export default controlRenderer

export const arrayListRenderer: JsonFormsRendererRegistryEntry = {
  renderer: controlRenderer,
  tester: rankWith(3, schemaTypeIs('array'))
}
</script>

<style lang="scss" scoped>
  .list-elements-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(30rem, 1fr));
    gap: 2rem;

    /deep/ .md-card {
      margin: 0;
    }
  }
  
  .md-subheading {
    color: rgba(0, 0, 0, 0.54);
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
</style>