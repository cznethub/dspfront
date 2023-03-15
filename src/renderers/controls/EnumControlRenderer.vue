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
      :hint="description"
      :required="control.required"
      :error-messages="control.errors"
      :clearable="hover && !control.schema.readOnly"
      :value="control.data"
      :items="control.options"
      :readonly="control.schema.readOnly"
      persistent-hint
      hide-details="auto"
      class="py-3"
      item-text="label"
      item-value="value"
      outlined
      dense
    >
      <template v-slot:message>
        <div v-if="description" class="text-subtitle-1 text--secondary">
          {{ description }}
        </div>
        <div v-if="cleanedErrors" class="ml-2 v-messages error--text">
          {{ cleanedErrors }}
        </div>
      </template>
    </v-select>
  </v-hover>
</template>

<script lang="ts">
import {
  ControlElement,
  JsonFormsRendererRegistryEntry,
  rankWith,
  isEnumControl,
} from '@jsonforms/core'
import { defineComponent } from 'vue'
import {
  rendererProps,
  useJsonFormsEnumControl,
  RendererProps,
} from '@jsonforms/vue2'
import { default as ControlWrapper } from './ControlWrapper.vue'
import { useVuetifyControl } from '@/renderers/util/composition';
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
    },
    cleanedErrors() {
      // @ts-ignore
      return this.control.errors.replaceAll(`is a required property`, ``)
    },
    description(): string {
      return this.control.description || this.appliedOptions.description || ''
    },
  }
})

export default controlRenderer
export const enumControlRenderer: JsonFormsRendererRegistryEntry = {
  renderer: controlRenderer,
  tester: rankWith(3, isEnumControl),
}
</script>