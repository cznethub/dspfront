<template>
  <div v-if="visible" :class="styles.control.root" :id="id" :data-id="computedLabel.replaceAll(` `, ``)">
    <div :class="styles.control.wrapper">
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts">
import { isDescriptionHidden } from '@jsonforms/core';
import { defineComponent, PropType } from 'vue';
import { Styles } from "@jsonforms/vue2-vanilla";

export default defineComponent({
  name: 'control-wrapper',
  props: {
    id: {
      required: true as true,
      type: String
    },
    description: {
      required: false as false,
      type: String,
      default: undefined
    },
    appliedOptions: {
      required: false as false,
      type: Object,
      default: undefined
    },
    visible: {
      required: false as false,
      type: Boolean,
      default: true
    },
    isFocused: {
      required: false as false,
      type: Boolean,
      default: false
    },
    styles: {
      required: true,
      type: Object as PropType<Styles>,
    },
  },
  computed: {
    showDescription(): boolean {
      return !isDescriptionHidden(
        this.visible,
        this.description,
        this.isFocused,
        !!this.appliedOptions?.showUnfocusedDescription
      );
    }
  }
});
</script>
