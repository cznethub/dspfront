<template>
  <v-card outlined>
    <!-- <v-card-header v-if="label">{{ label }}</v-card-header> -->
    <v-card-actions style="background: #f5f5f5;">
      <v-spacer></v-spacer>
      <v-btn elevation="1" fab small @click="moveUpClicked" :disabled="!moveUpEnabled">
        <v-icon>mdi-arrow-up</v-icon>
      </v-btn>

      <v-btn elevation="1" fab small @click="moveDownClicked" :disabled="!moveDownEnabled">
        <v-icon>mdi-arrow-down</v-icon>
      </v-btn>

      <v-btn elevation="1" fab small @click="deleteClicked" color="#ff6961" style="color: #FFF;">
        <v-icon>mdi-delete</v-icon>
      </v-btn>
    </v-card-actions>

    <v-divider></v-divider>

    <v-card-text>
      <slot></slot>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
declare type CompType<_S, V> = V
import { defineComponent } from '@vue/composition-api'
import { Styles } from "@jsonforms/vue2-vanilla"
import CzNotification from '@/models/notifications.model'

const listItem = defineComponent({
  name: 'array-list-element',
  props: {
    label: {
      required: false,
      type: String,
      default: ''
    },
    needsConfirmToDelete: {
      required: false,
      type: Boolean,
      default: true
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

      if (this.needsConfirmToDelete) {
        CzNotification.openDialog({
          title: 'Delete this item?',
          content: 'Are you sure you want to delete this  item?',
          confirmText: 'Delete',
          cancelText: 'Cancel',
          onConfirm: () => {
            // @ts-ignore
            this.delete?.()
          }
        })
      }
      else {
        // @ts-ignore
        this.delete?.()
      }
    },
  }
})

export default listItem
</script>

<style lang="scss" scoped>
  ::v-deep .v-card__accions {
    background-color: red;
  }
</style>