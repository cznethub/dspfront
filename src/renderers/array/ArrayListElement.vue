<template>
  <md-card>
    <!-- <md-card-header v-if="label">{{ label }}</md-card-header> -->
    <md-card-actions>
      <v-btn class="v-icon-button" @click="moveUpClicked" :disabled="!moveUpEnabled">
        <v-icon>arrow_upward</v-icon>
      </v-btn>

      <v-btn class="v-icon-button" @click="moveDownClicked" :disabled="!moveDownEnabled">
        <v-icon>arrow_downward</v-icon>
      </v-btn>

      <v-btn class="v-icon-button" @click="deleteClicked">
        <v-icon>delete</v-icon>
      </v-btn>
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
