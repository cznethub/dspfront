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
              <v-btn @click="$emit('save')" color="primary" class="submission-save" :disabled="isSaving || !!errors.length || !hasUnsavedChanges || isReadOnly" rounded>
                {{ isSaving ? "Saving..." : confirmText }}
              </v-btn>
            </v-badge>

            <v-badge :value="!!errors.length" bordered color="error" icon="mdi-exclamation-thick" overlap>
              <v-btn @click="$emit('save-and-finish')" class="ml-2 submission-finish" color="primary" :disabled="isSaving || !!errors.length || isReadOnly" rounded>
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
  @Prop() isReadOnly!: boolean
  @Prop() isDevMode!: boolean
  @Prop() hasUnsavedChanges!: boolean
  @Prop() isSaving!: boolean
  @Prop() confirmText!: string
  @Prop() errors!: ErrorObject[]

  protected getTitle(error: ErrorObject) {
    if (error.instancePath) {
      return error.parentSchema?.title || error.params.missingProperty
    }
    return error.parentSchema?.properties?.[error.params.missingProperty]?.title
      || error.params.missingProperty || ''
  }

  protected getMessage(error: ErrorObject) {
    if (error.keyword === 'required') {
      if (error.instancePath) {
        // Error is in a nested object
        // For combinator renderers we must anotate the fitting schema in the renderer itself and then use it here to get the corresponding prop title
        const isCombinatorSchema = this._isCombinatorSchema(error.parentSchema)
       
        const propTitle = isCombinatorSchema
          ? this._getCombinatorSchemaProperties(error.parentSchema)?.[error.params.missingProperty]?.title
          : error.parentSchema?.properties?.[error.params.missingProperty]?.title

        if (propTitle) {
          return `must have required property '${propTitle}'`
        }
      }
      else {
        return 'is a required property'
      }
    }
    return error.message
  }

  private _isCombinatorSchema(schema: any): string {
    return schema.anyOf ? 'anyOf' :
      schema.allOf ? 'allOf' :
      schema.oneOf ? 'oneOf' :
      ''
  }

  /** Find and return the properties array inside nested combinator schemas */
  private _getCombinatorSchemaProperties(schema: any) {
    const isCombinatorSchema = this._isCombinatorSchema(schema)

    if (!isCombinatorSchema) {
      return
    }

    let fittingSchema = schema[isCombinatorSchema].find(s => s.isFittingSchema)
    if (fittingSchema) {
      if (fittingSchema.properties) {
        return fittingSchema.properties
      }
      else {
        return this._getCombinatorSchemaProperties(fittingSchema)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.form-controls {
  gap: 0.5rem;
}
</style>
