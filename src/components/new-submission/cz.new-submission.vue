<template>
  <div class="cz-new-submission">
    <h1 class="">{{ formTitle }}</h1>
    <hr>
    <section class="section">
      <div class="container">
        <div class="">
          <img :src="activeRepository.get().logoSrc" :alt="activeRepository.get().name" style="width: 20rem;">
          <div class="form-controls">
            <v-btn v-if="isDevMode" @click="onShowUISchema()" class="">UI Schema</v-btn>
            <v-btn v-if="isEditMode" @click="goToSubmission()" class="">Cancel</v-btn>
            <v-btn class=" " @click="save()" :disabled="isSaving">
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
                  <v-icon>mdi-file</v-icon>
                  <p>Drop your files here or click to upload</p>
                </div>
              </section>
            </b-upload>
          </div>

          <div v-if="dropFiles.length" class="upload-file-list">
            <transition-group name="list-files">
              <v-chip
                v-for="(file, index) in dropFiles"
                :key="`${file.name}-${index}`"
                class="list-files-item"
                close
                color="secondary"
                @click:close="deleteDropFile(index)"
              >
                <v-icon left>mdi-file</v-icon>
                <strong>{{ file.name }}</strong>
              </v-chip>
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

        <v-progress-circular
          indeterminate
          color="primary"
        />

        <div v-if="!isLoading" class="form-controls has-space-top-2x ">
          <v-btn v-if="isDevMode" @click="onShowUISchema()" class="">UI Schema</v-btn>
          <v-btn v-if="isEditMode" @click="goToSubmission()" class="">Cancel</v-btn>
          <v-btn class=" " @click="save()" :disabled="isSaving">
            {{ isSaving ? 'Saving...' : submitText }}
          </v-btn>
        </div>
      </div>
    </section>

    <v-dialog v-if="isDevMode" v-model="showUISchema">
      <v-card>
        <v-card-title>
          UI Schema
        </v-card-title>
        <v-card-text>
          <div class="schema-wrapper">
            <json-viewer
              :value="usedUISchema"
              :expand-depth="5"
              copyable
              expanded
              sort />
          </div>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="showUISchema = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
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

  .schema-wrapper {
    width: 100rem;
    max-width: 100%;
    height: 0;
    flex: 1;
    overflow: auto;
    border-top: 1px solid #DDD;
    min-height: 75vh;
  }

  .upload-drop-area {
    border: 1px dashed #DDD;
    border-radius: 0.5rem;
    cursor: pointer;

    ::v-deep input[type=file] {
      display: none;
    }
  }

  .list-files {
    transition: all 1s;
  }

  .list-files-enter,
  .list-files-leave-to
  /* .list-complete-leave-active below version 2.1.8 */ {
    opacity: 0;
    // transform: translateY(30px);
  }

  .list-files-leave-active {
    position: absolute;
  }

  .form-controls {
    button + button {
      margin-left: 1rem;
    }
  }
</style>
