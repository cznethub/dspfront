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

        <div v-if="!isLoading && data" style="max-width: 60rem;">

          <b-field>
            <b-upload v-model="dropFiles" multiple drag-drop expanded>
              <section class="section">
                <div class="content has-text-centered">
                  <p>
                    <b-icon icon="upload" size="is-large"></b-icon>
                  </p>
                  <p class="is-size-4">Drop your files here or click to upload</p>
                </div>
              </section>
            </b-upload>
          </b-field>

          <div class="tags">
            <span v-for="(file, index) in dropFiles" :key="index" class="tag is-primary is-size-4">
              {{ file.name }}
              <button class="delete is-small" type="button" @click="deleteDropFile(index)"></button>
            </span>
          </div>

          <json-forms
            :data="data"
            :renderers="renderers"
            :schema="schema"
            :uischema="uischema"
            @change="onChange"
          />
        </div>
        <div class="has-space-top-2x level is-justify-content-flex-end">
          <b-button class="has-space-right" size="is-medium">Save</b-button>
          <b-button size="is-medium" type="is-primary">Submit</b-button>
        </div>
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
  import { CzRenderers } from '@/renderers/renderer.vue'

  const renderers = [
    ...vanillaRenderers,
    ...CzRenderers,
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
    protected dropFiles = []

    protected get schema() {
      return Zenodo.get()?.schema
    }

    async created() {
      const submission = await Zenodo.createSubmission()

      if (submission?.recordId) {
        this.data = submission?.formMetadata.metadata
        // console.log(this.schema)
        this.recordId = submission?.recordId
      }
      this.isLoading = false
    }

    protected deleteDropFile(index) {
      this.dropFiles.splice(index, 1);
    }

    onChange(event: JsonFormsChangeEvent) {
      this.data = event.data;
    }
  }
</script>

<style lang="scss" scoped>
  /deep/ .vertical-layout-item {
    margin: 1rem 0;
  }
</style>
