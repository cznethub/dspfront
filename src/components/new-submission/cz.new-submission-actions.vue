<template>
  <div class="cz-new-submission-actions d-flex align-center my-4">
    <v-spacer class="d-none d-sm-block"></v-spacer>
    <div
      class="d-flex form-controls flex-column flex-sm-row flex-grow-1 flex-sm-grow-0"
    >
      <v-btn
        v-if="isDevMode"
        @click="$emit('show-ui-schema')"
        class="my-1 my-sm-0"
        rounded
        >UI Schema</v-btn
      >
      <v-btn
        v-if="isEditMode"
        @click="$emit('cancel')"
        rounded
        class="submission-cancel my-2 my-sm-0"
        >{{ isPublished ? "Back" : "Cancel" }}</v-btn
      >
      <v-menu :disabled="!errors.length" open-on-hover bottom left offset-y>
        <template v-slot:activator="{ on, attrs }">
          <div
            v-bind="attrs"
            v-on="on"
            class="d-flex form-controls flex-column flex-sm-row"
          >
            <template v-if="!isPublished">
              <v-badge
                :value="!!errors.length"
                bordered
                color="error"
                icon="mdi-exclamation-thick"
                overlap
              >
                <v-btn
                  @click="$emit('save')"
                  color="primary"
                  class="submission-save my-1 my-sm-0"
                  :disabled="
                    isSaving ||
                    !!errors.length ||
                    !hasUnsavedChanges ||
                    isReadOnly
                  "
                  rounded
                  block
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
                  @click="$emit('save-and-finish')"
                  class="ml-sm-2 my-1 my-sm-0 submission-finish"
                  color="primary"
                  :disabled="isSaving || !!errors.length || isReadOnly"
                  rounded
                  block
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

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";

@Component({
  name: "cz-new-submission-actions",
  components: {},
})
export default class CzNewSubmissionActions extends Vue {
  @Prop() isEditMode!: boolean;
  @Prop() isReadOnly!: boolean;
  @Prop() isPublished!: boolean;
  @Prop() isDevMode!: boolean;
  @Prop() hasUnsavedChanges!: boolean;
  @Prop() isSaving!: boolean;
  @Prop() confirmText!: string;
  @Prop() errors!: any[];
}
</script>

<style lang="scss" scoped>
.form-controls {
  gap: 0.5rem;
}
</style>
