<template>
  <fieldset v-if="layout.visible" :class="`cz-fieldset mb-8 ${styles.group.root}` " :data-id="generateId">
    <legend v-if="layout.uischema.label"
      @click="isCollapsed = false"
      class="v-label"
      :class="styles.group.label + (!isCollapsed || !hasToggle ? ' v-label--active' : '')">{{ layout.uischema.label }}</legend>

    <div v-if="layout.uischema.description" class="text-subtitle-1 text--secondary mb-6">{{ layout.uischema.description }}</div>

    <v-tooltip v-if="hasToggle" bottom transition="fade">
      <template v-slot:activator="{ on: onTooltip }">
        <!-- ADD BUTTON -->
        <v-btn v-if="isCollapsed" icon color="primary"
          @click="isCollapsed = false" 
          :aria-label="`Add ${layout.schema.title}`"
          :disabled="!layout.enabled"
          class="btn-add" 
          v-on="onTooltip"
        >
          <v-icon>mdi-plus</v-icon>
        </v-btn>

        <!-- REMOVE BUTTON -->
        <v-btn v-else icon color="error"
          @click="collapse" 
          :aria-label="`Remove ${layout.schema.title}`"
          :disabled="!layout.enabled"
          class="btn-add" 
          v-on="onTooltip"
        >
          <v-icon>mdi-minus</v-icon>
        </v-btn>
      </template>
      {{ isCollapsed ? 'Add' : 'Remove' }} {{ layout.schema.title }}
    </v-tooltip>

    <template v-if="!isCollapsed || !hasToggle">
      <div
        v-for="(element, index) in layout.uischema.elements"
        :data-id="`group-${index}`"
        :key="`${layout.path}-${index}`"
        class="my-4"
        :class="styles.group.item"
      >
        <dispatch-renderer
          :schema="layout.schema"
          :uischema="element"
          :path="layout.path"
          :enabled="layout.enabled"
          :renderers="layout.renderers"
          :cells="layout.cells"
        />
      </div>
    </template>
  </fieldset>
</template>

<script lang="ts">
import {
  JsonFormsRendererRegistryEntry,
  Layout,
  rankWith,
  and,
  isLayout,
  uiTypeIs,
  ControlProps,
} from '@jsonforms/core'
import { defineComponent } from '@vue/composition-api'
import {
  DispatchRenderer,
  rendererProps,
  RendererProps,
  useJsonFormsControl,
  useJsonFormsLayout
} from '@jsonforms/vue2'
import { useVuetifyControl, useVuetifyLayout } from '@jsonforms/vue2-vuetify'

const layoutRenderer = defineComponent({
  name: 'group-renderer',
  components: {
    DispatchRenderer
  },
  props: {
    ...rendererProps<Layout>()
  },
  setup(props: RendererProps<Layout>) {
    return {
      ...useVuetifyLayout(
        useJsonFormsLayout(props)
      ),
      // Constructed just so we can call handleChange from a layout element
      ...useVuetifyControl(
        useJsonFormsControl({
          uischema: {... props.uischema, scope: ''},
          schema: props.schema,
          label: "",
          errors: '',
          data: [],
          id: '',
          visible: true,
          rootSchema: props.schema,
          enabled: props.enabled,
          path: props.path,
          handleChange: () => {}
        } as ControlProps),
        (value) => value || undefined
      ),
      isCollapsed: true
    }
  },
  created() {
    this.isCollapsed = !this.layout.data
  },
  methods: {
    collapse() {
      this.handleChange(this.layout.path, undefined)
      this.isCollapsed = true
    }
  },
  computed: {
    generateId(): string {
      // @ts-ignore
      return `group-${this.layout.uischema.label.replaceAll(" ", "")}`
    },
    hasToggle(): boolean {
      // If the layout has a path, it means we are rendering an object and want to be able to collapse it
      // Unless the field is required, and so we do not enable collapsing/expanding the field.
      return !!this.layout.path && !this.isRequired
    },
    // We have not way of detecting if the field is required from a layout element, so we check it using the computation that was done on the label
    isRequired(): boolean {
      return this.computedLabel === `${this.schema.title}*`
    }
  }
})

export default layoutRenderer

export const groupRenderer: JsonFormsRendererRegistryEntry = {
  renderer: layoutRenderer,
  tester: rankWith(3, and(isLayout, uiTypeIs('Group')))
}
</script>
