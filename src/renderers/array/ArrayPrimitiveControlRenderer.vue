<template>
  <v-hover v-slot="{ hover }">
    <v-combobox
      v-model="tags"
      @input="onTagsChange"
      hide-no-data
      :label="computedLabel"
      :data-id="computedLabel.replaceAll(` `, ``)"
      :hint="description"
      :delimiters="delimeters"
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
      :placeholder="placeholder"
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
          :disabled="!control.enabled"
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
  and,
  ControlElement,
  isPrimitiveArrayControl,
  JsonFormsRendererRegistryEntry,
  not,
  rankWith,
} from "@jsonforms/core"
import { defineComponent } from 'vue'
import { rendererProps, useJsonFormsControl } from "@jsonforms/vue2"
import { default as ControlWrapper } from '@/renderers/controls/ControlWrapper.vue'
import { VHover } from 'vuetify/lib'
import { useVuetifyControl } from '@/renderers/util/composition';

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
    if (!this.control.data) {
      this.onChange(undefined)
    }

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

    if (requiredValues && this.control.data) {
      // We need to check if existing values are required values with different casing. And if so, use the casing specified in required values.
      const existingValues = this.control.data
        .filter(val => !requiredValues.some(requiredVal => requiredVal.toLowerCase().trim() === val.toLowerCase().trim()))
      // TODO: add the missing requried value to the submission in the repository. For now autopopulated in our forms.
      this.tags = [...new Set([...requiredValues, ...existingValues])]
      this.onChange(this.tags)
    }
  },
  computed: {
    delimeters() {
      // @ts-ignore
      return this.control.schema.options?.delimeter === false ? undefined : [',']
    },
    placeholder(): string {
      // @ts-ignore
      return this.control.schema.options?.placeholder || this.appliedOptions.placeholder || ''
    },
    description(): string {
      return this.control.description || this.appliedOptions.description || ''
    },
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

const useArrayLayout = (uiSchema) => {
  return uiSchema.options?.useArrayLayout
}

export const arrayPrimitiveControlRenderer: JsonFormsRendererRegistryEntry = {
  renderer: controlRenderer,
  tester: rankWith(4, and(not(useArrayLayout), isPrimitiveArrayControl)),
}
</script>

<style lang="scss" scoped>
::v-deep .v-input__append-inner {
  display: none !important;
}
</style>


