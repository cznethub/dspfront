<template>
  <v-hover v-slot="{ hover }">
    <v-combobox
      v-model="tags"
      @input="onTagsChange"
      hide-no-data
      :label="computedLabel"
      :data-id="computedLabel.replaceAll(` `, ``)"
      :hint="control.description"
      :delimiters="[',']"
      :error-messages="control.errors"
      :menu-props="{ openOnClick: false }"
      class="py-3 mb-0"
      small-chips
      multiple
      no-filter
      outlined
      dense
      :id="control.id + '-input'"
      :class="styles.control.input"
      :disabled="!control.enabled"
      :autofocus="appliedOptions.focus"
      :placeholder="appliedOptions.placeholder"
      persistent-hint
      :required="control.required"
      :clearable="hover"
      :value="control.data"
      :items="control.options"
      item-text="label"
      item-value="value"
      @focus="isFocused = true"
      @blur="isFocused = false"
    >
      <template v-slot:selection="{ attrs, item }">
        <v-chip
          v-bind="attrs"
          :close="!isRequired(item)"
          small
          @click:close="remove(item)"
        >
          {{ item }}
        </v-chip>
      </template>
    </v-combobox>
  </v-hover>
</template>

<script lang="ts">
import {
  ControlElement,
  isPrimitiveArrayControl,
  JsonFormsRendererRegistryEntry,
  rankWith,
} from "@jsonforms/core"
import { defineComponent } from "@vue/composition-api"
import { rendererProps, useJsonFormsControl } from "@jsonforms/vue2"
import { default as ControlWrapper } from '@/renderers/controls/ControlWrapper.vue'
import { VHover } from 'vuetify/lib'
import { useVuetifyControl } from '@jsonforms/vue2-vuetify'

const controlRenderer = defineComponent({
  name: "control-renderer",
  components: {
    ControlWrapper,
    VHover
  },
  props: {
    ...rendererProps<ControlElement>(),
  },
  setup(props: any) {
    const tags: string[] =[]
    
    return {
      tags,
      ...useVuetifyControl(
        useJsonFormsControl(props),
        (value) => value || undefined
      )
    };
  },
  created() {
    // If no initial value, load default
    if (!this.control.data && this.control.schema.default) {
      this.tags = this.control.schema.default
      this.onChange(this.tags)
    }
    else if (this.control.data) {
      this.tags = this.control.data
      this.onChange(this.tags)
    }

    // @ts-ignore
    const requiredValues = this.control.schema.contains?.enum

    if (requiredValues) {
      if (this.control.data) {
        // TODO: add the requried value to the submission in the repository
        this.tags = [...new Set([...requiredValues, ...this.control.data])]
        this.onChange(this.tags)
      }
    }
  },
  methods: {
    onTagsChange() {
      // Prevent inserting duplicates and trim values
      this.tags = this.tags
        .filter(tag => !!tag.trim())
        .map(tag => tag.trim())
      this.tags = [...(new Set(this.tags))]
      this.handleChange(this.control.path, this.tags)
    },
    remove(item: string) {
      this.tags.splice(this.tags.indexOf(item), 1)
      this.onTagsChange()
    },
    isRequired(item: string) {
      // @ts-ignore
      return this.control.schema.contains && this.control.schema.contains.enum.includes(item)
    }
  }
});
export default controlRenderer;

export const arrayPrimitiveRenderer: JsonFormsRendererRegistryEntry = {
  renderer: controlRenderer,
  tester: rankWith(4, isPrimitiveArrayControl),
}
</script>

<style lang="scss" scoped>
::v-deep .v-input__append-inner {
  display: none !important;
}
</style>


