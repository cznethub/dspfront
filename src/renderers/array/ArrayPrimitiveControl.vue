<template>
  <!-- <control-wrapper
    v-bind="controlWrapper"
    :styles="styles"
    :isFocused="isFocused"
    :appliedOptions="appliedOptions"
  > -->
    <v-hover v-slot="{ hover }">
      <v-combobox
        v-model="tags"
        @input="onTagsChange"
        hide-no-data
        :label="computedLabel"
        :hint="control.description"
        :delimiters="[',']"
        :error-messages="control.errors"
        :menu-props="{ openOnClick: false }"
        class="my-2 mb-0"
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
        :persistent-hint="persistentHint()"
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
            close
            small
            @click:close="remove(item)"
          >
            {{ item }}
          </v-chip>
        </template>
      </v-combobox>
    </v-hover>
  <!-- </control-wrapper> -->
</template>

<script lang="ts">
import {
  isPrimitiveArrayControl,
  JsonFormsRendererRegistryEntry,
  rankWith,
} from "@jsonforms/core"
import { defineComponent } from "@vue/composition-api"
import { rendererProps, useJsonFormsControl } from "@jsonforms/vue2"
import { default as ControlWrapper } from '@/renderers/controls/ControlWrapper.vue'
import { VHover } from 'vuetify/lib'
import { useVuetifyControl } from '@jsonforms/vue2-vuetify'
// import { DisabledIconFocus } from '@/renderers/controls/directives/DisabledIconFocus'

const controlRenderer = defineComponent({
  name: "control-renderer",
  components: {
    ControlWrapper,
    VHover
  },
  props: {
    ...rendererProps(),
  },
  // directives: {
  //   DisabledIconFocus,
  // },
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
    // console.log(this.control)
    this.tags = this.control.schema.default
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


