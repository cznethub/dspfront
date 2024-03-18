<script lang="ts">
import { Component, Prop, Vue } from 'vue-facing-decorator'

@Component({
  name: 'cz-new-submission-actions',
  components: {},
})
export default class CzNewSubmissionActions extends Vue {
  @Prop() isEditMode!: boolean
  @Prop() repositoryUrl!: string
  @Prop() isDevMode!: boolean
  @Prop() hasUnsavedChanges!: boolean
  @Prop() isSaving!: boolean
  @Prop() confirmText!: string
  @Prop() errors!: any[]
}
</script>

<template>
  <div class="cz-new-submission-actions d-flex align-center my-4">
    <v-spacer class="d-none d-sm-block" />
    <div
      class="d-flex form-controls flex-column flex-sm-row flex-grow-1 flex-sm-grow-0"
    >
      <v-btn
        v-if="isDevMode"
        class="my-1 my-sm-0"
        rounded
        @click="$emit('show-ui-schema')"
      >
        UI Schema
      </v-btn>
      <v-btn
        v-if="isEditMode"
        rounded
        class="submission-cancel my-2 my-sm-0"
        @click="$emit('cancel')"
      >
        Cancel
      </v-btn>

      <v-menu :disabled="!errors.length" open-on-hover bottom left offset-y>
        <template #activator="{ on, attrs }">
          <div
            v-bind="attrs"
            class="d-flex form-controls flex-column flex-sm-row"
            v-on="on"
          >
            <template>
              <v-badge
                :value="!!errors.length"
                bordered
                color="error"
                icon="mdi-exclamation-thick"
                overlap
              >
                <v-btn
                  color="primary"
                  class="submission-save my-1 my-sm-0"
                  :disabled="isSaving || !!errors.length || !hasUnsavedChanges"
                  rounded
                  block
                  @click="$emit('save')"
                >
                  {{ isSaving ? "Saving..." : confirmText }}
                </v-btn>
              </v-badge>

              <v-badge
                :value="!!errors.length"
                bordered
                color="error"
                icon="mdi-exclamation-thick"
                overlap
              >
                <v-btn
                  class="ml-sm-2 my-1 my-sm-0 submission-finish"
                  color="primary"
                  :disabled="isSaving || !!errors.length"
                  rounded
                  block
                  @click="$emit('save-and-finish')"
                >
                  Finish
                </v-btn>
              </v-badge>
            </template>
          </div>
        </template>

        <div class="pa-4 has-bg-white">
          <ul
            v-for="(error, index) of errors"
            :key="index"
            class="text-subtitle-1"
          >
            <li>
              <b>{{ error.title }}</b> {{ error.message }}.
            </li>
          </ul>
        </div>
      </v-menu>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.form-controls {
  gap: 0.5rem;
}
</style>
