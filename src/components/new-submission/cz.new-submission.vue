<template>
  <div class="cz-new-submission">

    <section class="section">
      <div class="container">
        <div class="level">
          <h1 class="title is-1">New Submission</h1>
          <img :src="require('@/assets/img/placeholder.png')" alt="" style="width: 20rem;">
          <div>
            <b-button class="has-space-right" size="is-medium">Save</b-button>
            <b-button size="is-medium" type="is-primary">Submit</b-button>
          </div>
        </div>
        <p><b>Instructions</b>: Fill in the required fields (marked with *). Press the "Save" button to save your upload for later editing. When the form is complete, click the "Submit" button to upload your submission to the repository.</p>
      </div>
    </section>

    <section class="section">
      <div class="container" style="min-height: 20rem;">
        <b-loading :is-full-page="false" :active="isLoading" />

        <json-forms
          v-if="!isLoading && data"
          :data="data"
          :renderers="renderers"
          :schema="schema"
          :uischema="uischema"
          @change="onChange"
        />
      </div>
    </section>
  </div>
</template>

<script lang="ts">
  import Zenodo from '@/models/zenodo.model'
  import { Component, Vue } from 'vue-property-decorator'
  import { JsonForms, JsonFormsChangeEvent } from "@jsonforms/vue2"
  import { vanillaRenderers } from "@jsonforms/vue2-vanilla"
  import { JsonFormsRendererRegistryEntry } from '@jsonforms/core'
  import { inputRenderer } from '@/renderers/input/cz.input.renderer.vue'

  const renderers = [
    ...vanillaRenderers,
    inputRenderer
    // here you can add custom renderers
  ];

  @Component({
    name: 'cz-new-submission',
    components: { JsonForms },
  })
  export default class CzNewSubmission extends Vue {
    protected isLoading = true
    protected recordId = ''
    protected data = null
    protected renderers: JsonFormsRendererRegistryEntry[] = renderers
    protected uischema = null

    protected get schema() {
      return Zenodo.get()?.schema
    }

    async created() {
      const submission = await Zenodo.createSubmission()
      if (submission?.recordId) {
        this.data = submission?.formMetadata.metadata
        this.recordId = submission?.recordId
      }
      this.isLoading = false
    }

    onChange(event: JsonFormsChangeEvent) {
      this.data = event.data;
    }
  }
</script>

<style lang="scss" scoped>
  
</style>
