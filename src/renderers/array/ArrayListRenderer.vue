<template>
  <div v-if="control.visible">
    <div class="md-layout md-alignment-center-space-between has-space-bottom">
      <h4 class="md-subheading">{{ control.label }}</h4>

      <md-button class="md-icon-button md-raised md-accent" @click="addButtonClick" :class="styles.arrayList.addButton">
        <md-icon>add</md-icon>
      </md-button>
    </div>

    <transition-group name="list-complete" class="list-elements-container" tag="div">
      <array-list-element
        v-for="(element, index) in control.data"
        class="list-complete-item"
        :key="`${control.path}-${index}`"
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
    </transition-group>

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
import ArrayListElement from './ArrayListElement.vue'

const controlRenderer = defineComponent({
  name: 'array-list-renderer',
  components: {
    ArrayListElement,
    DispatchRenderer
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
  methods: {
    composePaths,
    createDefaultValue,
    addButtonClick() {
      this.addItem(
        this.control.path,
        createDefaultValue(this.control.schema)
      )()
    }
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

  .list-complete-item {
    transition: all 0.35s ease;
  }

  .list-complete-enter,
  .list-complete-leave-to {
    opacity: 0;
    // transform: translateY(30px);
  }

  .list-complete-leave-active {
    position: absolute;
  }

  .md-subheading {
    color: rgba(0, 0, 0, 0.54);
  }
</style>