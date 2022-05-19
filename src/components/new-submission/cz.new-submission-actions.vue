<template>
  <div class="cz-new-submission-actions d-flex align-center my-4">
    <v-spacer></v-spacer>
    <div class="d-flex form-controls">
      <v-btn v-if="isDevMode" @click="$emit('show-ui-schema')" rounded
        >UI Schema</v-btn
      >
      <v-btn v-if="isEditMode" @click="$emit('cancel')" rounded class="submission-cancel"
        >Cancel</v-btn
      >
      <v-menu :disabled="!errors.length" open-on-hover bottom left offset-y>
        <template v-slot:activator="{ on, attrs}">
          <div v-bind="attrs" v-on="on">
            <v-badge :value="!!errors.length" bordered color="error" icon="mdi-exclamation-thick" overlap>
              <v-btn @click="$emit('save')" color="primary" class="submission-save" :disabled="isSaving || !!errors.length || !hasUnsavedChanges" rounded>
                {{ isSaving ? "Saving..." : confirmText }}
              </v-btn>
            </v-badge>

            <v-badge :value="!!errors.length" bordered color="error" icon="mdi-exclamation-thick" overlap>
              <v-btn @click="$emit('save-and-finish')" class="ml-2 submission-finish" color="primary" :disabled="isSaving || !!errors.length" rounded>
                Finish
              </v-btn>
            </v-badge>
          </div>
        </template>

        <div class="pa-4 has-bg-white">
          <ul v-for="(error, index) of errors" :key="index" class="text-subtitle-1">
            <li><b>{{ getTitle(error) }}</b> {{ getMessage(error) }}.</li>
          </ul>
        </div>
      </v-menu>
    </div>
  </div>
</template>

<script lang="ts">
import { ErrorObject } from "ajv"
import { Component, Vue, Prop } from "vue-property-decorator"

@Component({
  name: "cz-new-submission-actions",
  components: {  },
})
export default class CzNewSubmissionActions extends Vue {
  @Prop() isEditMode!: boolean
  @Prop() isDevMode!: boolean
  @Prop() hasUnsavedChanges!: boolean
  @Prop() isSaving!: boolean
  @Prop() confirmText!: string
  @Prop() errors!: ErrorObject[]

  protected getTitle(error: ErrorObject) {
    if (error.instancePath) {
      return error.parentSchema?.title || error.params.missingProperty
    }
    return error.params.missingProperty || ''
  }

  protected getMessage(error: any) {
    if (!error.instancePath && error.keyword === 'required') {
      return 'is a required property'
    }
    return error.message
  }
}
</script>

<style lang="scss" scoped>
.form-controls {
  gap: 0.5rem;
}
</style>
