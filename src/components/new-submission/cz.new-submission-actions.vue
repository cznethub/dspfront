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
        @click="$emit('showUiSchema')"
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

      <v-menu :disabled="!errors.length" open-on-hover open-on-click bottom left offset-y>
        <template #activator="{ props }">
          <div
            v-bind="props"
            class="d-flex form-controls flex-column flex-sm-row"
          >
            <v-badge
              :model-value="!isValid"
              bordered
              color="error"
              icon="mdi-exclamation-thick"
              overlap
            >
              <v-btn
                :color="canConfirm ? 'primary' : 'default'"
                class="submission-save my-1 my-sm-0"
                :disabled="!canConfirm || !hasUnsavedChanges"
                rounded
                block
                @click="$emit('save')"
              >
                {{ isSaving ? "Saving..." : confirmText }}
              </v-btn>
            </v-badge>

            <v-badge
              :model-value="!isValid"
              bordered
              color="error"
              icon="mdi-exclamation-thick"
              overlap
            >
              <v-btn
                class="ml-sm-2 my-1 my-sm-0 submission-finish"
                :color="canConfirm ? 'primary' : 'default'"
                :disabled="!canConfirm"
                rounded
                block
                @click="$emit('saveAndFinish')"
              >
                Finish
              </v-btn>
            </v-badge>
          </div>
        </template>

        <v-card class="bg-white">
          <v-card-text>
            <ul
              v-for="(error, index) of errors"
              :key="index"
              class="text-subtitle-1 ml-4"
            >
              <li>
                <b>{{ error.title }}</b> {{ error.message }}.
              </li>
            </ul>
          </v-card-text>
        </v-card>
      </v-menu>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, toNative } from 'vue-facing-decorator'

@Component({
  name: 'cz-new-submission-actions',
  components: {},
  emits: ['showUiSchema', 'saveAndFinish', 'cancel', 'save'],
})
class CzNewSubmissionActions extends Vue {
  @Prop() isEditMode!: boolean
  @Prop() repositoryUrl!: string
  @Prop() isDevMode!: boolean
  @Prop() hasUnsavedChanges!: boolean
  @Prop() isSaving!: boolean
  @Prop() confirmText!: string
  @Prop() errors!: any[]

  get canConfirm() {
    return !this.isSaving && !this.errors.length
  }

  get isValid() {
    return !this.errors.length
  }
}
export default toNative(CzNewSubmissionActions)
</script>

<style lang="scss" scoped>
.form-controls {
  gap: 0.5rem;
}
</style>
