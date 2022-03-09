<template>
  <v-container id="cz-new-submission" class="cz-new-submission px-4">
    <h1 class="text-h4">{{ formTitle }}</h1>
    <v-divider class="mb-4"></v-divider>
    <v-alert v-if="!isLoading && wasLoaded" class="text-subtitle-1 my-8" border="left" colored-border type="info" elevation="2">
      <b>Instructions</b>: Fill in the required fields (marked with * and highlighted in red).
      Press the "Save" button to upload your
      submission.

      <v-img
        class="my-4"
        :src="activeRepository.get().logoSrc"
        :alt="activeRepository.get().name"
        width="200px"
        contain
      />
    </v-alert>

    <cz-new-submission-actions
      v-if="!isLoading && wasLoaded"
      :isEditMode="isEditMode"
      :isDevMode="isDevMode"
      :isSaving="isSaving"
      :confirmText="submitText"
      :errors="errors"
      @show-ui-schema="onShowUISchema"
      @save-and-finish="onSaveAndFinish"
      @save="onSave"
      @cancel="goToSubmissions"
    />

    <div>
      <div v-if="!isLoading">
        <cz-folder-structure
          v-if="!isExternal && wasLoaded"
          ref="folderStructure"
          v-model="uploads"
          @upload="uploadFiles($event)"
          :rootDirectory.sync="rootDirectory"
          :allowFolders="repoMetadata[repository].hasFolderStructure"
          :isEditMode="isEditMode"
          :identifier="identifier"
        />

        <json-forms
          v-if="wasLoaded"
          @change="onChange"
          :disabled="isSaving"
          :data="data"
          :renderers="Object.freeze(renderers)"
          :schema="schema"
          :uischema="uischema"
          ref="form"
        />
      </div>

      <div v-else class="d-flex justify-center mt-8">
        <v-progress-circular indeterminate color="primary" />
      </div>

      <cz-new-submission-actions
        v-if="!isLoading && wasLoaded"
        :isEditMode="isEditMode"
        :isDevMode="isDevMode"
        :isSaving="isSaving"
        :confirmText="submitText"
        :errors="errors"
        @showUiSchema="onShowUISchema"
        @save="onSave"
        @save-and-finish="onSaveAndFinish"
        @cancel="goToSubmissions"
      />
    </div>

    <v-container v-if="!isLoading && !wasLoaded">
      <v-skeleton-loader type="actions, article, actions"></v-skeleton-loader>
    </v-container>

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

    <v-dialog
      :value="isSaving"
      no-click-animation
      hide-overlay
      persistent
      width="300"
      attach="#cz-new-submission"
    >
      <v-card
        class="py-4"
        color="primary"
        dark
      >
        <v-card-text >
          <p>Saving...</p>
          <v-progress-linear
            indeterminate
            color="white"
            class="mb-0"
          ></v-progress-linear>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-overlay class="backdrop" absolute v-if="isSaving" />
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
import { ErrorObject } from 'ajv'
import { Subscription } from "rxjs"
import JsonViewer from "vue-json-viewer"
import Repository from "@/models/repository.model"
import CzNotification from "@/models/notifications.model"
import CzFolderStructure from "@/components/new-submission/cz.folder-structure.vue"
import CzNewSubmissionActions from "@/components/new-submission/cz.new-submission-actions.vue"
import User from "@/models/user.model"
// import { vuetifyRenderers } from '@jsonforms/vue2-vuetify'

const sprintf = require("sprintf-js").sprintf

const renderers = [
  ...vanillaRenderers, 
  ...CzRenderers,
  // ...vuetifyRenderers
]

@Component({
  name: "cz-new-submission",
  components: { JsonForms, JsonViewer, CzFolderStructure, CzNewSubmissionActions },
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
  protected errors: ErrorObject[]  = []
  protected repositoryRecord: any = null
  protected authorizedSubject = new Subscription()
  protected hasUnsavedChanges = true
  protected timesChanged = 0

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
    return false
    // TODO: uncomment when this env variable is properly setup in production
    // return process.env.NODE_ENV === "development"
  }

  protected get isExternal() {
    return this.repoMetadata[this.repository].isExternal
  }

  protected get formTitle() {
    if (this.isExternal) {
      return 'Register Dataset from External Repository'
    }
    return this.isEditMode ? "Edit Submission" : `Submit to ${ this.activeRepository.name }`
  }

  protected get submitText() {
    return this.isEditMode ? "Save Changes" : "Save"
  }

  protected get wasLoaded() {
    return this.isEditMode
      ? !!this.repositoryRecord
      : true
  }

  created() {
    this.init()
  }

  beforeDestroy() {
    this.authorizedSubject.unsubscribe()
  }

  init() {
    this.isLoading = true
    this.data = this.schemaDefaults
    this.timesChanged = 0 // Need to reset in case we are redirecting from the creation page and the component wasn't destroyed

    const routeRepositoryKey = this.$route.params
      .repository as EnumRepositoryKeys

    if (
      !this.activeRepository ||
      this.activeRepository.get()?.key !== routeRepositoryKey
    ) {
      // Check that the key from the url is actually a EnumRepositoryKeys
      if (EnumRepositoryKeys[routeRepositoryKey]) {
        this.setActiveRepository(routeRepositoryKey)
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
    this.repositoryRecord = await Repository.readSubmission(this.identifier, this.repository)

    // TODO: all of this should be cleaned in the backend. Make fields with null values undefined
    if (this.repositoryRecord) {
      Object.keys(this.repositoryRecord).map((key) => {
        if (this.repositoryRecord[key] === null) {
          this.repositoryRecord[key] = undefined
        }
      })
    }

    console.info("CzNewSubmission: reading existing files...")
    if (!this.isExternal && this.repositoryRecord) {
      const initialStructure: (IFile | IFolder)[] = await this.activeRepository.readRootFolder(this.identifier, '', this.rootDirectory)
      this.rootDirectory.children = initialStructure
    }
    this.isLoadingInitialFiles = false

    if (this.repositoryRecord) {
      this.data = {
        ...this.data,
        ...this.repositoryRecord,
      }
      // this.links = repositoryRecord?.formMetadata.links // Has useful links, i.e: bucket for upload
    }
    else {
      // Try again when user has authorized the repository
      this.authorizedSubject = Repository.authorized$.subscribe(async (repository: string) => {
        this.isLoading = true
        await this.loadExistingSubmission()
      })
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

  protected async onSaveAndFinish() {
    const wasSaved = await this._save()

    if (wasSaved) {
      User.commit((state) => {
        state.hasUnsavedChanges = false
      })
      this.$router.push({ name: "submissions" })
    }
  }

  protected async onSave() {
    const wasSaved = await this._save()
    if (wasSaved && !this.isEditMode) {
      User.commit((state) => {
        state.hasUnsavedChanges = false
      })
      this.isSaving = false
      // If creating, redirect to the edit page
      this.$router.push({
        name: "submit.repository",
        params: { repository: this.activeRepository.entity, id: this.identifier },
      })
      this.init()
    }
  }

  private async _save() {
    this.isSaving = true
    let submission

    // If first time saving, create a new record
    if (!this.identifier) {
      console.info("CzNewSubmission: creating new record...")
      try {
        submission = await this.activeRepository?.createSubmission(this.data, this.repository)
      } catch (e) {
        console.log(e)
        CzNotification.toast({ message: 'Failed to create submission' })
        this.isSaving = false
        return false
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

    // If we are in edit mode, files have already been saved
    if (!this.isEditMode) {
      await this.uploadFiles(this.uploads)
    }

    // Indicate that changes have been saved
    CzNotification.toast({
      message: this.isEditMode
        ? "Your changes have been saved"
        : "Your submission has been saved!",
    })

    return true
  }

  protected onChange(event: JsonFormsChangeEvent) {
    // Pristine/dirty checks are currently not supported in jsonforms.
    // We use onChange event for now by ignoring the two times it is called when the form is rendered.
    // https://spectrum.chat/jsonforms/general/pristine-and-dirty-checking~2ece93ab-7783-41cb-8ba1-804414eb1da4?m=MTU2MzM0OTY0NDQxNg==
    if (this.timesChanged <= 2) {
      this.timesChanged = this.timesChanged + 1
    }

    if (this.timesChanged > 2) {
      User.commit((state) => {
        state.hasUnsavedChanges = true
      })
    }
    else {
      User.commit((state) => {
        state.hasUnsavedChanges = false
      })
    }

    this.errors = event.errors || []
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

::v-deep .v-overlay.backdrop {
  z-index: 4 !important;
}

::v-deep .v-label--active {
  transform: translateY(-26px) scale(1) !important;
  background-color: #FFF;
  padding-right: 0.2rem;
}

::v-deep .horizontal-layout {
  gap: 2rem;
}
</style>
