<template>
  <div class="cz-new-submission">
    <section class="section">
      <div class="container">
        <div class="level">
          <h1 class="title is-1">New Submission - {{ activeRepository ? activeRepository.get().key : '' }}</h1>
          <img :src="activeRepository.get().logoSrc" :alt="activeRepository.get().name" style="width: 20rem;">
          <div>
            <md-button v-if="isDevMode" @click="onShowUISchema()" class="md-raised">UI Schema</md-button>
            <md-button class="md-raised" @click="save()" :disabled="isSaving">
              {{ isSaving ? 'Saving...' : 'Save' }}
            </md-button>
            <md-button class="md-raised md-accent">Submit</md-button>
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

    <md-dialog v-if="isDevMode" :md-active.sync="showUISchema" :md-fullscreen="true">
      <md-dialog-title>UI Schema</md-dialog-title>
      <div class="schema-wrapper">
        <json-viewer
          :value="usedUISchema"
          :expand-depth="5"
          copyable
          expanded
          sort />
      </div>
    </md-dialog>
  </div>
</template>

<script lang="ts">
  import { Component, Vue, Ref } from 'vue-property-decorator'
  import { JsonForms, JsonFormsChangeEvent } from "@jsonforms/vue2"
  import { vanillaRenderers } from "@jsonforms/vue2-vanilla"
  import { JsonFormsRendererRegistryEntry } from '@jsonforms/core'
  import { CzRenderers } from '@/renderers/renderer.vue'
  import { EnumRepositoryKeys } from '../submissions/types'
  import JsonViewer from 'vue-json-viewer'
  import Repository from '@/models/repository.model'
  import HydroShare from '@/models/hydroshare.model'
  import Zenodo from '@/models/zenodo.model'

  const sprintf = require('sprintf-js').sprintf

  const renderers = [
    ...vanillaRenderers,
    ...CzRenderers,
  ];

  @Component({
    name: 'cz-new-submission',
    components: { JsonForms, JsonViewer },
  })
  export default class CzNewSubmission extends Vue {
    @Ref('form') jsonForm!: typeof JsonForms 
    protected isLoading = false
    protected isSaving = false
    protected recordId = ''
    protected data: any = {}
    protected links: any = {}
    protected renderers: JsonFormsRendererRegistryEntry[] = renderers
    protected dropFiles: File[] = []
    protected showUISchema = false
    protected usedUISchema = {}

    protected get schema() {
      return this.activeRepository?.get()?.schema
    }

    protected get uischema() {
      return this.activeRepository?.get()?.uischema
    }

    protected get schemaDefaults() {
      return this.activeRepository?.get()?.schemaDefaults
    }

    protected get isDevMode() {
      return process.env.NODE_ENV === 'development'
    }

    // TODO: add to a mixin and reuse
    protected get activeRepository() {
      const key = Repository.$state.submittingTo
      switch (key) {
        case EnumRepositoryKeys.hydroShare: return HydroShare
        case EnumRepositoryKeys.zenodo: return Zenodo
        default: return Zenodo
      }
    }

    created() {
      this.data = this.schemaDefaults
      const routeRepositoryKey = this.$route.params.repository as EnumRepositoryKeys
      
      if (!this.activeRepository || this.activeRepository.get()?.key !== routeRepositoryKey) {
        console.log(Object.keys(EnumRepositoryKeys), routeRepositoryKey)
        // Check that the key from the url is actually a EnumRepositoryKeys
        if (Object.keys(EnumRepositoryKeys).includes(routeRepositoryKey)) {
          
          this.setActiveRepository(routeRepositoryKey)
        }
      }
    }

    protected onShowUISchema() {
      if (this.jsonForm) {
        this.usedUISchema = this.jsonForm.uischemaToUse
      }
      else {
        this.usedUISchema = {}  // default
      }
      this.showUISchema = true
    }

    protected async save() {
      this.isSaving = true

      // If first time saving, create a new record
      if (!this.recordId) {
        console.info('CzNewSubmission: creating new record...')
        const submission = await this.activeRepository?.createSubmission(this.data)

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
        this.activeRepository?.updateMetadata(this.data, this.recordId)
      }

      // If files have been selected for upload, upload them
      if (this.dropFiles.length) {
        const url = sprintf(this.activeRepository?.get()?.urls?.fileCreateUrl, this.recordId) 
        this.activeRepository?.uploadFiles(url, this.dropFiles)
      }

      this.isSaving = false
    }

    protected deleteDropFile(index) {
      this.dropFiles.splice(index, 1);
    }

    protected onChange(event: JsonFormsChangeEvent) {
      this.data = event.data
    }

    private setActiveRepository(key: EnumRepositoryKeys) {
      Repository.commit((state) => {
        state.submittingTo = key
      })
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

  .schema-wrapper {
    width: 100rem;
    max-width: 100%;
    height: 0;
    flex: 1;
    overflow: auto;
    border-top: 1px solid #DDD;
    min-height: 75vh;
  }

  .md-dialog /deep/.md-dialog-container {
    max-width: 100rem;
  }
</style>
