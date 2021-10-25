<template>
  <div class="cz-new-submission">

    <section class="section">
      <div class="container">
        <div class="level">
          <h1 class="title is-1">New Submission</h1>
          <img :src="require('@/assets/img/placeholder.png')" alt="" style="width: 20rem;">
          <div>
            <b-button @click="save()" class="has-space-right" size="is-medium" :disabled="isSaving">
              {{ isSaving ? 'Saving...' : 'Save' }}
            </b-button>
            <b-button size="is-medium" type="is-primary">Submit</b-button>
          </div>
        </div>
        <p><b>Instructions</b>: Fill in the required fields (marked with *). Press the "Save" button to save your upload for later editing. When the form is complete, click the "Submit" button to upload your submission to the repository.</p>
      </div>
    </section>

    <section class="section">
      <div class="container" style="min-height: 20rem;">
        <b-loading :is-full-page="false" :active="isLoading" />

        <div v-if="!isLoading" style="max-width: 60rem;">
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
            :disabled="isSaving"
            :data="data"
            :renderers="renderers"
            :schema="schema"
            :uischema="uischema"
            @change="onChange"
            ref="form"
          />
        </div>
        <div class="has-space-top-2x level is-justify-content-flex-end">
          <b-button @click="save()" class="has-space-right" size="is-medium" :disabled="isSaving">
            {{ isSaving ? 'Saving...' : 'Save' }}
          </b-button>
          <b-button size="is-medium" type="is-primary">Submit</b-button>
        </div>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
  import Zenodo from '@/models/zenodo.model'
  import { Component, Vue, Ref } from 'vue-property-decorator'
  import { JsonForms, JsonFormsChangeEvent } from "@jsonforms/vue2"
  import { vanillaRenderers } from "@jsonforms/vue2-vanilla"
  import { JsonFormsRendererRegistryEntry } from '@jsonforms/core'
  import { CzRenderers } from '@/renderers/renderer.vue'
  const sprintf = require('sprintf-js').sprintf

  const renderers = [
    ...vanillaRenderers,
    ...CzRenderers,
  ];

  @Component({
    name: 'cz-new-submission',
    components: { JsonForms },
  })
  export default class CzNewSubmission extends Vue {
    @Ref('form') jsonForm!: typeof JsonForms 
    protected isLoading = false
    protected isSaving = false
    protected recordId = ''
    protected data: any = {}
    protected links: any = {}
    protected renderers: JsonFormsRendererRegistryEntry[] = renderers
    protected uischema = null
    protected dropFiles: File[] = []

    protected get schema() {
      return Zenodo.get()?.schema
    }

    created() {
      console.log(this.schema)
    }

    protected async save() {
      this.isSaving = true

      // If first time saving, create a new record
      if (!this.recordId) {
        console.info('CzNewSubmission: creating new record...')
        const submission = await Zenodo.createSubmission(this.data)

        if (submission?.recordId) {
          this.data = {
            ...this.data,
            ...submission?.formMetadata.metadata,
          }
          this.links = submission?.formMetadata.links // Has useful links, i.e: bucket for upload
          this.recordId = submission?.recordId
        }
      }
      else {
        Zenodo.updateMetadata(this.data, this.recordId)
      }

      // If files have been selected for upload, upload them
      if (this.dropFiles.length) {
        // const filesToUpload: { name: string, data: any }[] = []

        const url = sprintf(Zenodo.get()?.urls?.fileCreateUrl, this.recordId) 
        Zenodo.uploadFiles(url, this.dropFiles)

        // for (let file of this.dropFiles) {
        //   const reader = new FileReader()

        //   reader.onload = (e) => { 
        //     filesToUpload.push({ name: file.name, data: e.target?.result })
        //     if (filesToUpload.length === this.dropFiles.length) {
        //       console.log(this.data)
        //       // All files have now been read and are ready to upload
        //       // Zenodo.uploadFiles(this.links.bucket, filesToUpload) // New api
        //       const url = sprintf(Zenodo.get()?.urls?.fileCreateUrl, this.recordId) 
        //       Zenodo.uploadFiles(url, filesToUpload)  // Old api
        //     }
        //   }

        //   reader.readAsBinaryString(file)
        // }
      }

      this.isSaving = false
    }

    protected deleteDropFile(index) {
      this.dropFiles.splice(index, 1);
    }

    onChange(event: JsonFormsChangeEvent) {
      this.data = event.data
    }
  }
</script>

<style lang="scss" scoped>
  /deep/ .vertical-layout-item {
    margin: 1rem 0;

    select {
      width: 100%;
    }
  }
</style>