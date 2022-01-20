<template>
  <v-combobox
    v-model="tags"
    @input="onChange"
    :label="control.label"
    :hint="control.description"
    :delimiters="[',']"
    :error-messages="control.errors"
    :menu-props="{ openOnClick: false }"
    clearable
    small-chips
    multiple
    no-filter
    outlined
  >
    <template v-slot:selection="{ attrs, item }">
      <v-chip
        v-bind="attrs"
        close
        @click:close="remove(item)"
      >
        {{ item }}
      </v-chip>
    </template>
  </v-combobox>
</template>

<script lang="ts">
import {
  isPrimitiveArrayControl,
  JsonFormsRendererRegistryEntry,
  rankWith,
} from "@jsonforms/core"
import { defineComponent } from "@vue/composition-api"
import { rendererProps, useJsonFormsControl } from "@jsonforms/vue2"

// https://www.npmjs.com/package/@jsonforms/vue2

const controlRenderer = defineComponent({
  name: "control-renderer",
  props: {
    ...rendererProps(),
  },
  setup(props: any) {
    const tags: string[] =[]
    return {
      tags,
      ...useJsonFormsControl(props),
    };
  },
  created() {
    // console.log(this.control)
    this.tags = this.control.schema.default
  },
  methods: {
    onChange() {
      // Prevent inserting duplicates and trim values
      this.tags = this.tags
        .filter(tag => !!tag.trim())
        .map(tag => tag.trim())
      this.tags = [...(new Set(this.tags))]
      this.handleChange(this.control.path, this.tags)
    },
    remove(item: string) {
      this.tags.splice(this.tags.indexOf(item), 1)
      this.onChange()
    },
  },
});
export default controlRenderer;

export const enumControlRenderer: JsonFormsRendererRegistryEntry = {
  renderer: controlRenderer,
  tester: rankWith(3, isPrimitiveArrayControl),
};
</script>

<style lang="scss" scoped>
</style>


