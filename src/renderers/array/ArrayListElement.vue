<template>
  <md-card>
    <!-- <md-card-header v-if="label">{{ label }}</md-card-header> -->
    <md-card-actions>
      <md-button class="md-icon-button" @click="moveUpClicked" :disabled="!moveUpEnabled">
        <md-icon>arrow_upward</md-icon>
      </md-button>

      <md-button class="md-icon-button" @click="moveDownClicked" :disabled="!moveDownEnabled">
        <md-icon>arrow_downward</md-icon>
      </md-button>

      <md-button class="md-icon-button" @click="deleteClicked">
        <md-icon>delete</md-icon>
      </md-button>
    </md-card-actions>

    <md-divider></md-divider>

    <md-card-content>
      <slot></slot>
    </md-card-content>
  </md-card>
</template>

<script lang="ts">
declare type CompType<_S, V> = V
import { defineComponent } from '@vue/composition-api'
import { Styles } from "@jsonforms/vue2-vanilla"

const listItem = defineComponent({
  name: 'array-list-element',
  props: {
    label: {
      required: false,
      type: String,
      default: ''
    },
    moveUpEnabled: {
      required: false,
      type: Boolean,
      default: true
    },
    moveDownEnabled: {
      required: false,
      type: Boolean,
      default: true
    },
    moveUp: {
      required: false,
      type: Function,
      default: undefined
    },
    moveDown: {
      required: false,
      type: Function,
      default: undefined
    },
    delete: {
      required: false,
      type: Function,
      default: undefined
    },
    styles: {
      required: true,
      type: Object as CompType<Styles, ObjectConstructor>
    }
  },
  data() {
    return { }
  },
  computed: {
  },
  methods: {
    moveUpClicked(event: Event): void {
      event.stopPropagation()
      // @ts-ignore
      this.moveUp?.()
    },
    moveDownClicked(event: Event): void {
      event.stopPropagation()
      // @ts-ignore
      this.moveDown?.()
    },
    deleteClicked(event: Event): void {
      event.stopPropagation()
      // @ts-ignore
      this.delete?.()
    },
  }
})

export default listItem
</script>
