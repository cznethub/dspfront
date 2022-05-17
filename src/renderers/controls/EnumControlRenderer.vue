<template>
  <v-hover v-if="!isHidden" v-slot="{ hover }">
    <v-select
      @change="onChange"
      @focus="isFocused = true"
      @blur="isFocused = false"
      :id="control.id + '-input'"
      :data-id="computedLabel.replaceAll(` `, ``)"
      :disabled="!control.enabled || control.schema.readOnly"
      :autofocus="appliedOptions.focus"
      :placeholder="appliedOptions.placeholder"
      :label="computedLabel"
      :hint="control.description"
      :required="control.required"
      :error-messages="control.errors"
      :clearable="hover && !control.schema.readOnly"
      :value="control.data"
      :items="control.options"
      :readonly="control.schema.readOnly"
      persistent-hint
      class="my-2"
      item-text="label"
      item-value="value"
      outlined
      dense
    />
  </v-hover>
</template>

<script lang="ts">
import {
  ControlElement,
  JsonFormsRendererRegistryEntry,
  rankWith,
  isEnumControl,
} from '@jsonforms/core'
import { defineComponent } from '@vue/composition-api'
import {
  rendererProps,
  useJsonFormsEnumControl,
  RendererProps,
} from '@jsonforms/vue2'
import { default as ControlWrapper } from './ControlWrapper.vue'
import { useVuetifyControl } from '@jsonforms/vue2-vuetify'
import { VSelect, VHover } from 'vuetify/lib'

const controlRenderer = defineComponent({
  name: 'enum-control-renderer',
  components: {
    ControlWrapper,
    VSelect,
    VHover,
  },
  props: {
    ...rendererProps<ControlElement>(),
  },
  created() {
    console.log(this.control.options)
    if (this.control && !this.control.data) {
      this.handleChange(this.control.path, this.control.schema.default)
    }
  },
  setup(props: RendererProps<ControlElement>) {
    return useVuetifyControl(
      useJsonFormsEnumControl(props),
      (value) => value || undefined
    )
  },
  computed: {
    isHidden(): boolean {
      // @ts-ignore
      return this.control.schema.options && this.control.schema.options.hidden
    }
  }
})

export default controlRenderer
export const enumControlRenderer: JsonFormsRendererRegistryEntry = {
  renderer: controlRenderer,
  tester: rankWith(3, isEnumControl),
}
</script>