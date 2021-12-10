<template>
  <div class="cz-new-submission">
    <h1 class="md-display-1">{{ formTitle }}</h1>
    <hr>
    <section class="section">
      <div class="container">
        <div class="md-layout md-alignment-center-space-between">
          <img :src="activeRepository.get().logoSrc" :alt="activeRepository.get().name" style="width: 20rem;">
          <div class="form-controls">
            <!-- <v-btn v-if="isDevMode" @click="onShowUISchema()" class="md-raised">UI Schema</v-btn> -->
            <v-btn v-if="isEditMode" @click="goToSubmission()" class="md-raised">Cancel</v-btn>
            <v-btn class="md-raised md-accent" @click="save()" :disabled="isSaving">
              {{ isSaving ? 'Saving...' : submitText }}
            </v-btn>
          </div>
        </div>
        <p><b>Instructions</b>: Fill in the required fields (marked with *). Press the "Save" button to save your upload for later editing. When the form is complete, click the "Submit" button to upload your submission to the repository.</p>
      </div>
    </section>

    <section class="section">
      <div class="container" style="min-height: 20rem;">
        <div v-if="!isLoading">
          <div class="upload-drop-area has-space-bottom">
            <b-upload v-model="dropFiles" multiple drag-drop expanded>
              <section class="section">
                <div class="content has-text-centered">
                  <v-icon>attach_file</v-icon>
                  <p>Drop your files here or click to upload</p>
                </div>
              </section>
            </b-upload>
          </div>

          <div v-if="dropFiles.length" class="upload-file-list">
            <transition-group name="list-items" tag="div">
              <md-chip v-for="(file, index) in dropFiles"
                :key="`${file.name}-${index}`" class="md-primary list-items-item" md-deletable @md-delete="deleteDropFile(index)">
                {{ file.name }}
              </md-chip>
            </transition-group>
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

        <md-progress-spinner v-else md-mode="indeterminate"></md-progress-spinner>

        <div v-if="!isLoading" class="form-controls has-space-top-2x md-layout md-alignment-center-right">
          <!-- <v-btn v-if="isDevMode" @click="onShowUISchema()" class="md-raised">UI Schema</v-btn> -->
          <v-btn v-if="isEditMode" @click="goToSubmission()" class="md-raised">Cancel</v-btn>
          <v-btn class="md-raised md-accent" @click="save()" :disabled="isSaving">
            {{ isSaving ? 'Saving...' : submitText }}
          </v-btn>
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
  import CzNotification from '@/models/notifications.model'
  import Submission from '@/models/submission.model'

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

    protected get isEditMode() {
      return this.$route.params.id !== undefined
    }

    protected get schema() {
      return this.activeRepository?.get()?.schema
    }

    protected get uischema() {
      return this.activeRepository?.get()?.uischema || undefined
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
        case EnumRepositoryKeys.hydroshare: return HydroShare
        case EnumRepositoryKeys.zenodo: return Zenodo
        default: return Zenodo
      }
    }

    protected get formTitle() {
      return this.isEditMode ? 'Edit Submission' : 'New Submission'
    }

    protected get submitText() {
      return this.isEditMode ? 'Save Changes' : 'Save'
    }

    created() {
      this.isLoading = true
      this.data = this.schemaDefaults
      const routeRepositoryKey = this.$route.params.repository as EnumRepositoryKeys
      
      if (!this.activeRepository || this.activeRepository.get()?.key !== routeRepositoryKey) {
        // Check that the key from the url is actually a EnumRepositoryKeys
        if (EnumRepositoryKeys[routeRepositoryKey]) {
          this.setActiveRepository(routeRepositoryKey)
        }
      }

      if (this.isEditMode) {
        const identifier = this.$route.params.id
        const submission = Submission.find([identifier, this.activeRepository.entity])
        this.recordId = submission?.identifier || ''  // TODO: get the recordId and update it here
        this.loadExistingSubmission()
      }
      else {
        this.isLoading = false
      }
    }

    protected goToSubmission() {
      this.$router.push({ name: 'submissions', params: { id: this.recordId, repository: this.activeRepository.entity } })
    }

    protected async loadExistingSubmission() {
      console.info('CzNewSubmission: reading existing record...')
      const repositoryRecord = await this.activeRepository?.read(this.recordId)

      if (repositoryRecord) {
        this.data = {
          ...this.data,
          ...repositoryRecord,
        }
        // this.links = repositoryRecord?.formMetadata.links // Has useful links, i.e: bucket for upload
      }
      this.isLoading = false
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

      let submission

      // If first time saving, create a new record
      if (!this.recordId) {
        console.info('CzNewSubmission: creating new record...')
        try {
          submission = await this.activeRepository?.createSubmission(this.data)
        }
        catch(e) {
          this.isSaving = false
          return
        }

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
        console.info('CzNewSubmission: Saving to existing record...')
        await this.activeRepository?.updateRepositoryRecord(this.recordId, this.data)
      }

      // If files have been selected for upload, upload them
      if (this.dropFiles.length) {
        const url = sprintf(this.activeRepository?.get()?.urls?.fileCreateUrl, this.recordId) 
        await this.activeRepository?.uploadFiles(url, this.dropFiles)
      }

      // Indicate that changes have been saved
      CzNotification.toast({
        message: this.isEditMode ? 'Your changes have been saved' : 'Your submission has been saved!'
      })

      this.$router.push({ name: 'submissions', params: { id: this.recordId, repository: this.activeRepository.entity } })
      
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
  .cz-new-submission {
    padding: 2rem;
  }

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

  .upload-drop-area {
    border: 1px dashed #DDD;
    border-radius: 0.5rem;
    cursor: pointer;

    /deep/ input[type=file] {
      display: none;
    }
  }

  .upload-file-list .md-chip {
    margin: 0.5rem;
  }

  /deep/ .md-field {
    // display: block;
    flex-wrap: wrap;

    &::after, &::before {
      content: none;
    }

    label {
      top: -6px !important;
      font-size: 16px !important;
      color: inherit !important;
      left: 0 !important;
      pointer-events: unset !important;
      cursor: unset !important;
    }

    .md-input,
    .md-textarea {
      border: 1px solid var(--text-mute);
      border-radius: 0.5rem;
      padding-left: 0.5rem;
      width: 100%;
    }

    .md-menu.md-select {
      flex: 1 1 auto;

      & > .v-icon {
        position: absolute;
        right: 0;
        top: 2rem;
      }
    }

    & > .md-helper-text {
      position: static;
      flex-basis: 100%;
      flex-shrink: 0;
      height: unset;
    }

    &.md-datepicker {
      max-width: 40rem;
      flex-wrap: wrap;

      & > input {
        margin-left: 0 !important;
        padding-left: 4rem;
      }

      & > i.md-date-icon {
        position: absolute;
        left: 4px;
        overflow: hidden;
      }
    }

    &.md-chips {
      padding-top: 16px;

      .md-helper-text {
        margin-bottom: 1rem;
      }

      // & > input {
      //   flex-basis: 100%;
      //   flex-shrink: 0;
      // }
    }

    &.md-required label:after {
      content: "(required)";
      color: red;
      font-size: 11px;
      margin-left: 4px;
      vertical-align: middle;
      
      transform: none;
      position: unset;
      top: unset;
      right: unset;
      line-height: 1em;
    }
  }

  .list-items {
    transition: all 1s;
  }

  .list-items-enter,
  .list-items-leave-to
  /* .list-complete-leave-active below version 2.1.8 */ {
    opacity: 0;
    // transform: translateY(30px);
  }

  .list-items-leave-active {
    position: absolute;
  }

  .form-controls {
    button + button {
      margin-left: 1rem;
    }
  }
</style>
