<template>
  <v-container class="cz-new-submission">
    <h1 class="text-h4">{{ formTitle }}</h1>
    <v-divider class="mb-4"></v-divider>
    <v-row>
      <v-col md="4" sm="12" order-md="2">
        <v-alert class="text-subtitle-1" border="left" colored-border type="info" elevation="2">
          <b>Instructions</b>: Fill in the required fields (marked with *).
          Press the "Save" button to upload your
          submission to the repository.

          <v-img
            class="my-4"
            :src="activeRepository.get().logoSrc"
            :alt="activeRepository.get().name"
            width="200px"
            contain
          />
        </v-alert>
      </v-col>

      <v-col md="8" sm="12" order-md="1">
        <div class="d-flex align-center my-4">
          <v-spacer></v-spacer>
          <div class="form-controls">
            <v-btn v-if="isDevMode" @click="onShowUISchema()" rounded
              >UI Schema</v-btn
            >
            <v-btn v-if="isEditMode" @click="goToSubmissions()" rounded
              >Cancel</v-btn
            >
            <v-btn @click="save()" color="primary" :disabled="isSaving" rounded>
              {{ isSaving ? "Saving..." : submitText }}
            </v-btn>
          </div>
        </div>

        <div>
          <div class="container">
            <div v-if="!isLoading">
              <cz-folder-structure
                ref="folderStructure"
                v-model="uploads"
                @upload="uploadFiles($event)"
                :rootDirectory.sync="rootDirectory"
                :allowFolders="repoMetadata[repository].hasFolderStructure"
                :isEditMode="isEditMode"
                :identifier="identifier"
              />

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

            <v-progress-circular v-else indeterminate color="primary" />

            <!-- TODO: MOVE INTO COMPONENT AND REUSE -->
            <div
              v-if="!isLoading"
              class="form-controls has-space-top-2x text-right"
            >
              <v-btn v-if="isDevMode" @click="onShowUISchema()" rounded
                >UI Schema</v-btn
              >
              <v-btn v-if="isEditMode" @click="goToSubmissions()" rounded
                >Cancel</v-btn
              >
              <v-btn
                @click="save()"
                color="primary"
                :disabled="isSaving"
                rounded
              >
                {{ isSaving ? "Saving..." : submitText }}
              </v-btn>
            </div>
          </div>
        </div>
      </v-col>
    </v-row>

    <v-dialog v-if="isDevMode" v-model="showUISchema">
      <v-card>
        <v-card-title> UI Schema </v-card-title>
        <v-card-text>
          <div class="schema-wrapper">
            <json-viewer
              :value="usedUISchema"
              :expand-depth="5"
              copyable
              expanded
              sort
            />
          </div>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="showUISchema = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script lang="ts">
import { Component, Ref } from "vue-property-decorator"
import { JsonForms, JsonFormsChangeEvent } from "@jsonforms/vue2"
import { vanillaRenderers } from "@jsonforms/vue2-vanilla"
import { JsonFormsRendererRegistryEntry } from "@jsonforms/core"
import { CzRenderers } from "@/renderers/renderer.vue"
import { EnumRepositoryKeys, IRepositoryUrls } from "../submissions/types"
import { mixins } from 'vue-class-component'
import { ActiveRepositoryMixin } from '@/mixins/activeRepository.mixin'
import { repoMetadata } from "../submit/constants"
import { IFile, IFolder } from '@/components/new-submission/types'
import JsonViewer from "vue-json-viewer"
import Repository from "@/models/repository.model"
import CzNotification from "@/models/notifications.model"
import CzFolderStructure from "@/components/new-submission/cz.folder-structure.vue"
// import { vuetifyRenderers } from '@jsonforms/vue2-vuetify'

const sprintf = require("sprintf-js").sprintf

const renderers = [
  ...vanillaRenderers, 
  ...CzRenderers,
  // ...vuetifyRenderers
]

@Component({
  name: "cz-new-submission",
  components: { JsonForms, JsonViewer, CzFolderStructure },
})
export default class CzNewSubmission extends mixins<ActiveRepositoryMixin>(ActiveRepositoryMixin) {
  @Ref("form") jsonForm!: typeof JsonForms
  // @Ref("folderStructure") folderStructure!: InstanceType<typeof CzFolderStructure>

  protected rootDirectory: IFolder = { name: 'root', children: [], parent: null, key: '', path: '' }
  protected isLoading = false
  protected isLoadingInitialFiles = false
  protected isSaving = false
  protected identifier = ""
  protected data: any = {}
  protected links: any = {}
  protected renderers: JsonFormsRendererRegistryEntry[] = renderers
  protected showUISchema = false
  protected usedUISchema = {}
  protected repoMetadata = repoMetadata
  protected uploads: (IFile | IFolder)[] = []

  protected get isEditMode() {
    return this.$route.params.id !== undefined
  }

  protected get repository() {
    return this.$route.params.repository
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
    return process.env.NODE_ENV === "development"
  }

  protected get formTitle() {
    return this.isEditMode ? "Edit Submission" : `Submit to ${ this.activeRepository.name }`
  }

  protected get submitText() {
    return this.isEditMode ? "Save Changes" : "Save"
  }

  created() {
    this.isLoading = true
    this.data = this.schemaDefaults
    const routeRepositoryKey = this.$route.params
      .repository as EnumRepositoryKeys;

    if (
      !this.activeRepository ||
      this.activeRepository.get()?.key !== routeRepositoryKey
    ) {
      // Check that the key from the url is actually a EnumRepositoryKeys
      if (EnumRepositoryKeys[routeRepositoryKey]) {
        this.setActiveRepository(routeRepositoryKey);
      }
    }

    if (this.isEditMode) {
      const identifier = this.$route.params.id
      this.identifier = identifier
      this.loadExistingSubmission()
    } else {
      this.isLoading = false
    }
  }

  protected goToSubmissions() {
    // TODO: add discard confirm dialog if the form was changed
    this.$router.push({
      name: "submissions",
    })
  }

  protected async loadExistingSubmission() {
    // TODO: these 2 calls can be performed in parallel
    console.info("CzNewSubmission: reading existing record...")
    const repositoryRecord = await Repository.readSubmission(this.identifier, this.repository)

    console.info("CzNewSubmission: reading existing files...")
    const initialStructure: (IFile | IFolder)[] = await this.activeRepository.readRootFolder(this.identifier, '', this.rootDirectory)
    this.rootDirectory.children = initialStructure
    this.isLoadingInitialFiles = false

    if (repositoryRecord) {
      this.data = {
        ...this.data,
        ...repositoryRecord,
      };
      // this.links = repositoryRecord?.formMetadata.links // Has useful links, i.e: bucket for upload
    }
    else {
      // TODO: indicate in the UI that submission was not loaded
    }

    this.isLoading = false
  }

  protected onShowUISchema() {
    if (this.jsonForm) {
      this.usedUISchema = this.jsonForm.uischemaToUse;
    } else {
      this.usedUISchema = {} // default
    }
    this.showUISchema = true
  }

  protected async save() {
    this.isSaving = true
    let submission

    // If first time saving, create a new record
    if (!this.identifier) {
      console.info("CzNewSubmission: creating new record...")
      try {
        submission = await this.activeRepository?.createSubmission(this.data, this.repository)
      } catch (e) {
        this.isSaving = false
        return;
      }

      if (submission?.identifier) {
        // this.data = {
        //   ...this.data,
        //   ...submission?.formMetadata.metadata,
        // };
        // this.links = submission?.formMetadata.links; // Has useful links, i.e: bucket for upload
        // TODO: getting a full url as identifier instead of just the identifier
        // I.e: http://beta.hydroshare.org/resource/99b2bc413274446185eb489ed312de45
        // Parsing it for now...
        // HydroShare
        this.identifier = submission.identifier
      }
    } else {
      console.info("CzNewSubmission: Saving to existing record...")
      await this.activeRepository?.updateSubmission(
        this.identifier,
        this.data
      )
    }

    await this.uploadFiles(this.uploads)

    // Indicate that changes have been saved
    CzNotification.toast({
      message: this.isEditMode
        ? "Your changes have been saved"
        : "Your submission has been saved!",
    })
    this.$router.push({ name: "submissions" })
  }

  protected onChange(event: JsonFormsChangeEvent) {
    this.data = event.data
  }

  protected async uploadFiles(files: (IFolder | IFile)[]) {
    const repoUrls: IRepositoryUrls | undefined  = this.activeRepository?.get()?.urls

    if (files.length && repoUrls) {
       const url = sprintf(
        repoUrls.fileCreateUrl,
        this.identifier
      )

      const createFolderUrl = sprintf(
        repoUrls.folderCreateUrl,
        this.identifier,
        '%s'  // replaced file by file inside repo model
      )
      await this.activeRepository?.uploadFiles(url, files, createFolderUrl)
    }
  }
}
</script>

<style lang="scss" scoped>
// .cz-new-submission {
// }

.schema-wrapper {
  max-width: 100%;
  height: 0;
  flex: 1;
  overflow: auto;
  border-top: 1px solid #ddd;
  min-height: 75vh;
}

.form-controls {
  button + button {
    margin-left: 1rem;
  }
}

::v-deep .v-label--active {
  transform: translateY(-26px) scale(1) !important;
  background-color: #FFF;
  padding-right: 0.2rem;
}
</style>
