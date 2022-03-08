<template>
  <div class="cz-new-submission-actions d-flex align-center my-4">
    <v-spacer></v-spacer>
    <div class="d-flex form-controls">
      <v-btn v-if="isDevMode" @click="$emit('show-ui-schema')" rounded
        >UI Schema</v-btn
      >
      <v-btn v-if="isEditMode" @click="$emit('cancel')" rounded
        >Cancel</v-btn
      >
      <v-menu :disabled="!errors.length" open-on-hover bottom left offset-y>
        <template v-slot:activator="{ on, attrs}">
          <div v-bind="attrs" v-on="on">
            <v-badge :value="!!errors.length" bordered color="error" icon="mdi-exclamation-thick" overlap>
              <v-btn @click="$emit('save')" color="primary" :disabled="isSaving || !!errors.length" rounded>
                {{ isSaving ? "Saving..." : confirmText }}
              </v-btn>
            </v-badge>
          </div>
        </template>

        <div class="pa-4 has-bg-white">
          <ul v-for="(error, index) of errors" :key="index" class="text-subtitle-1">
            <li><b>{{ error.dataPath.split('.').pop() }}</b> {{ error.message }}.</li>
          </ul>
        </div>
      </v-menu>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator"

@Component({
  name: "cz-new-submission-actions",
  components: {  },
})
export default class CzNewSubmissionActions extends Vue {
  @Prop() isEditMode!: boolean
  @Prop() isDevMode!: boolean
  @Prop() isSaving!: boolean
  @Prop() confirmText!: string
  @Prop() errors!: string[]
}
</script>

<style lang="scss" scoped>
.form-controls {
  gap: 0.5rem;
}
</style>
