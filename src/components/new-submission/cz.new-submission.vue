<template>
  <v-container id="cz-new-submission" class="cz-new-submission px-4">
    <h1 class="text-h4">
      {{ formTitle }}
    </h1>
    <v-divider class="mb-4" />
    <v-alert
      v-if="!isLoading && wasLoaded"
      id="instructions"
      class="text-subtitle-1 my-8"
      border="start"
      border-color="primary"
      type="info"
      variant="outlined"
      density="compact"
    >
      <div
        class="d-flex flex-wrap-wrap justify-space-between flex-column flex-md-row text-black"
      >
        <div>
          <div class="font-weight-bold">
            Instructions
          </div>
          <p>
            Fill in the required fields (marked with * and highlighted in red).
            Press the "Save / Finish" button to upload your submission.
          </p>
        </div>

        <v-img
          class="my-4 flex-grow-0 ml-md-4 ml-0"
          :src="activeRepository.get()?.logoSrc"
          :alt="activeRepository.get()?.name"
          width="350px"
          max-height="80px"
          contain
        />
      </div>
    </v-alert>

    <cz-new-submission-actions
      v-if="!isLoading && wasLoaded"
      id="cz-new-submission-actions-top"
      :repository-url="repositoryUrl"
      :is-edit-mode="isEditMode"
      :allow-file-upload="allowFileUpload"
      :is-dev-mode="isDevMode"
      :is-saving="isSaving"
      :confirm-text="submitText"
      :errors="errors"
      :has-unsaved-changes="hasUnsavedChanges"
      @save-and-finish="onSaveAndFinish"
      @save="onSave"
      @cancel="goToSubmissions"
    />

    <div>
      <div v-if="!isLoading">
        <cz-file-explorer
          v-if="hasFileExplorer"
          id="cz-folder-structure"
          ref="fileExplorer"
          v-model:valid-items="toUpload"
          :root-directory="rootDirectory"
          :has-folders="fileExplorerConfig.hasFolders"
          :is-read-only="fileExplorerConfig.isReadOnly"
          :has-file-metadata="() => false"
          :supported-file-types="supportedFileTypes"
          :upload="isEditMode ? uploadFiles : undefined"
          :delete-file-or-folder="isEditMode && activeRepository.deleteFileOrFolder ? deleteFileOrFolder : undefined"
          :rename-file-or-folder="isEditMode && activeRepository.renameFileOrFolder ? renameFileOrFolder : undefined"
        >
          <template #prepend>
            <span />
          </template>
        </cz-file-explorer>

        <template v-if="wasLoaded">
          <cz-form
            v-if="schema"
            ref="form"
            v-model="data"
            v-model:is-valid="isValid"
            :schema="schema"
            :uischema="uiSchema"
            :config="config"
            @update:errors="onUpdateErrors"
            @update:model-value="onDataChange"
          />
        </template>
      </div>

      <div v-else class="d-flex justify-center mt-8">
        <v-progress-circular
          id="progress-circular"
          indeterminate
          color="primary"
        />
      </div>

      <cz-new-submission-actions
        v-if="!isLoading && wasLoaded"
        id="cz-new-submission-actions-bottom"
        :repository-url="repositoryUrl"
        :is-edit-mode="isEditMode"
        :allow-file-upload="allowFileUpload"
        :is-dev-mode="isDevMode"
        :is-saving="isSaving"
        :confirm-text="submitText"
        :errors="errors"
        :has-unsaved-changes="hasUnsavedChanges"
        @save-and-finish="onSaveAndFinish"
        @save="onSave"
        @cancel="goToSubmissions"
      />
    </div>

    <v-container v-if="isLoading">
      <v-skeleton-loader type="actions, article, actions" />
    </v-container>

    <template v-if="!isLoading && !wasLoaded">
      <template v-if="wasUnauthorized">
        <v-alert
          class="text-subtitle-1"
          border="start"
          colored-border
          type="info"
          variant="outlined"
        >
          <v-row>
            <v-col class="flex-grow-1 text-black">
              We need your authorization to load this submission from the
              repository.
            </v-col>
            <v-col class="flex-grow-0">
              <v-btn
                color="primary"
                @click="openAuthorizePopup(repositoryKey)"
              >
                <i class="fas fa-key mr-2" />Authorize
              </v-btn>
            </v-col>
          </v-row>
        </v-alert>
      </template>

      <template v-else-if="!isLoggedIn">
        <v-alert
          class="text-subtitle-1"
          border="start"
          colored-border
          type="info"
          variant="outlined"
        >
          <v-row>
            <v-col class="flex-grow-1 text-black">
              You need to log in to access this submission.
            </v-col>
            <v-col class="flex-grow-0">
              <v-btn id="orcid_login_continue" color="primary" @click="onLogIn">
                <v-icon class="mr-2">
                  fab fa-orcid
                </v-icon>
                <span>Log In Using ORCID</span>
              </v-btn>
            </v-col>
          </v-row>
        </v-alert>

        <div class="d-flex justify-center mt-8">
          <v-icon style="font-size: 8rem" class="text-disabled">
            mdi-login
          </v-icon>
        </div>
      </template>

      <template v-else>
        <v-alert
          class="text-subtitle-1"
          border="start"
          colored-border
          type="error"
          variant="outlined"
        >
          We could not load this submission. The service might be unavailable or
          the submission might have been deleted.
        </v-alert>

        <div class="d-flex justify-center mt-8">
          <v-icon style="font-size: 8rem" class="text--disabled">
            mdi-database-off-outline
          </v-icon>
        </div>
      </template>
    </template>

    <v-dialog
      v-model="isSaving"
      no-click-animation
      hide-overlay
      persistent
      width="300"
      attach="#cz-new-submission"
    >
      <v-card class="py-4" color="primary" dark>
        <v-card-text>
          <p id="new-submission-saving" class="mb-4 text-center text-body-2">
            Saving...
          </p>
          <v-progress-linear
            indeterminate
            color="white"
            class="mb-0"
          />
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-overlay v-if="isSaving" class="backdrop" absolute />
  </v-container>
</template>

<script lang="ts">
import type { IFile, IFolder } from '@cznethub/cznet-vue-core/dist/types'
import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import type { IRepositoryUrls } from '../submissions/types'
import { CzFileExplorer, CzForm, Notifications } from '@cznethub/cznet-vue-core'
import { Subscription } from 'rxjs'
import { sprintf } from 'sprintf-js'
import { Component, Hook, mixins, Ref, toNative } from 'vue-facing-decorator'
import { useRoute, useRouter } from 'vue-router'
import CzNewSubmissionActions from '~/components/new-submission/cz.new-submission-actions.vue'
import { DELETED_RESOURCE_STATUS_CODES } from '~/constants'
import { hasUnsavedChangesGuard } from '~/guards'
import { ActiveRepositoryMixin } from '~/mixins/activeRepository.mixin'
import Repository from '~/models/repository.model'
import Submission from '~/models/submission.model'
import User from '~/models/user.model'
import { EnumRepositoryKeys } from '../submissions/types'
import { repoMetadata } from '../submit/constants'

const initialData = {}

@Component({
  name: 'cz-new-submission',
  components: {
    CzNewSubmissionActions,
    CzForm,
    CzFileExplorer,
  },
})
class CzNewSubmission extends mixins(ActiveRepositoryMixin) {
  @Ref('fileExplorer') fileExplorer!: InstanceType<
    typeof CzFileExplorer
  >

  route = useRoute()
  router = useRouter()

  rootDirectory: Partial<IFolder> = {
    name: 'root',
    children: [
    ],
  }

  isValid = false
  isLoading = false
  isLoadingInitialFiles = false
  isSaving = false
  identifier = ''
  data: Partial<IFolder> = initialData
  usedUISchema = {}
  repoMetadata = repoMetadata
  toUpload = []
  errors: { title: string, message: string }[] = []
  repositoryRecord: any = null
  loggedInSubject = new Subscription()
  timesChanged = 0
  wasUnauthorized = false
  allowFileUpload = true
  repositoryKey: EnumRepositoryKeys = EnumRepositoryKeys.external

  get config() {
    return {
      restrict: true,
      trim: false,
      showUnfocusedDescription: false,
      hideRequiredAsterisk: false,
      collapseNewItems: false,
      breakHorizontal: false,
      initCollapsed: false,
      hideAvatar: false,
      hideArraySummaryValidation: false,
      vuetify: {
        commonAttrs: {
          'density': 'compact',
          'variant': 'outlined',
          'persistent-hint': true,
          'hide-details': false,
        },
      },
      // isViewMode: true,
      isReadOnly: this.isPublished || this.isHsCollection,
      // isDisabled: false,
    }
  }

  fileExplorerConfig = {
    isReadOnly: false, // Unused for now
    hasFolders: false,
  }

  get dbSubmission() {
    const identifier = this.route.params.id?.toString()
    const submission = Submission.find([identifier, 'hydroshare'])
    return submission
  }

  get isHsCollection(): boolean {
    return this.dbSubmission?.metadata.type === 'CollectionResource'
  }

  get isHsComposite(): boolean {
    return this.dbSubmission?.metadata.type === 'CompositeResource'
  }

  get isEclSubmitted(): boolean {
    return (
      this.activeRepository.entity === EnumRepositoryKeys.earthchem
      && this.dbSubmission?.metadata.status === 'submitted'
    )
  }

  get isPublished(): boolean {
    if (this.activeRepository.entity === EnumRepositoryKeys.hydroshare)
      return !!this.dbSubmission?.metadata.published
    else if (this.activeRepository.entity === EnumRepositoryKeys.earthchem)
      return this.dbSubmission?.metadata.status === 'published'

    return false
  }

  get repositoryUrl() {
    return this.dbSubmission?.url
  }

  get isEditMode() {
    return this.route.params.id?.length
  }

  get hasFileExplorer() {
    return this.wasLoaded && !this.isExternal && !this.isHsCollection
  }

  get schema() {
    return this.activeRepository?.get()?.schema
  }

  get supportedFileTypes() {
    return this.repoMetadata[this.repositoryKey].supportedFileTypes
  }

  get uiSchema() {
    return this.activeRepository?.get()?.uischema || undefined
  }

  get schemaDefaults() {
    return this.activeRepository?.get()?.schemaDefaults
  }

  get isDevMode() {
    return false
    // TODO: uncomment when this env variable is properly setup in production
    // return import.meta.env.NODE_ENV === "development"
  }

  get isExternal() {
    return this.repoMetadata[this.repositoryKey].isExternal
  }

  get formTitle() {
    if (this.isExternal)
      return 'Register Dataset from External Repository'

    return this.isEditMode
      ? 'Edit Submission'
      : `Submit to ${this.activeRepository?.get()?.name}`
  }

  get submitText() {
    return this.isEditMode ? 'Save Changes' : 'Save'
  }

  get wasLoaded() {
    return this.isEditMode ? !!this.repositoryRecord : true
  }

  get hasUnsavedChanges(): boolean {
    return User.$state.hasUnsavedChanges
  }

  get registeringSubmission(): Partial<Submission> | null {
    return User.$state.registeringSubmission
  }

  set hasUnsavedChanges(value: boolean) {
    User.commit((state) => {
      state.hasUnsavedChanges = value
    })
  }

  get isLoggedIn() {
    return User.$state.isLoggedIn
  }

  created() {
    this.init()
  }

  beforeDestroy() {
    this.loggedInSubject.unsubscribe()
  }

  init() {
    this.isLoading = true
    this.data = this.schemaDefaults || {}
    this.timesChanged = 0 // Need to reset in case we are redirecting from the creation page and the component wasn't destroyed
    this.hasUnsavedChanges = false
    this.wasUnauthorized = false
    this.repositoryKey = this.route.params.repository as EnumRepositoryKeys

    if (
      !this.activeRepository
      || this.activeRepository.get()?.key !== this.repositoryKey
    ) {
      // Check that the key from the url is actually a EnumRepositoryKeys
      if (Object.values(EnumRepositoryKeys).includes(this.repositoryKey))
        this.setActiveRepository(this.repositoryKey)
    }

    this.fileExplorerConfig.hasFolders = this.activeRepository.entity === EnumRepositoryKeys.hydroshare

    if (this.isEditMode) {
      this.identifier = this.route.params.id?.toString()
      this.loadSavedSubmission()
    }
    else {
      this.isLoading = false
    }
  }

  onLogIn() {
    User.logIn()
  }

  goToSubmissions() {
    this.router.push({
      name: 'submissions',
    })
  }

  async loadSavedSubmission() {
    console.info('[CzNewSubmission]: Reading existing record...')
    const response
      = this.route.query.mode === 'register'
        ? this.registeringSubmission
          ? { metadata: this.registeringSubmission } // Load it from persistent state if we have it
          : await Repository.readExistingSubmission(
            this.identifier,
            this.repositoryKey,
          ) // Otherwise, refetch from repository
        : await Repository.readSubmission(this.identifier, this.repositoryKey)
    if (response === 401) {
      // Repository was unauthorized
      this.wasUnauthorized = true

      // Try again when user has authorized the repository
      this.authorizedSubject = Repository.authorized$.subscribe(
        async (_repositoryKey: EnumRepositoryKeys) => {
          this.isLoading = true
          await this.loadSavedSubmission()
        },
      )
    }
    else if (response === 403) {
      // Submission not found or service unavailable
      this.repositoryRecord = null

      if (!this.isLoggedIn) {
        this.loggedInSubject = User.loggedIn$.subscribe(async () => {
          this.isLoading = true
          await this.loadSavedSubmission()
        })
      }
    }
    else if (DELETED_RESOURCE_STATUS_CODES.includes(response)) {
      // Resource has been deleted in repository
      this.repositoryRecord = null
      Notifications.openDialog({
        title: 'This resource has been deleted',
        content: `The resource you requested does not exist in the remote repository. It may have been deleted outside of the ${this.$t(
          'portalName',
        )}. Do you want to remove it from your list of submissions?`,
        confirmText: 'Remove',
        cancelText: 'Cancel',
        onConfirm: async () => {
          await Repository.deleteSubmission(
            this.identifier,
            this.repositoryKey,
          )
          this.router.push({ name: 'submissions' })
        },
      })
    }
    else {
      this.repositoryRecord = response?.metadata
      this.wasUnauthorized = false

      // // Redirect to view page if submission is not editable
      // if (this.isPublished || this.isHsCollection || this.isEclSubmitted) {
      //   this.router.push({
      //     name: "view-submission",
      //     params: {
      //       id: this.identifier,
      //       repositoryKey: this.activeRepository.entity,
      //     },
      //   });
      // }
    }

    if (this.repositoryRecord) {
      Object.keys(this.repositoryRecord).forEach((key) => {
        if (this.repositoryRecord[key] === null)
          this.repositoryRecord[key] = undefined
      })

      // For HydroShare, only allow file upload for Composite Resources
      if (this.activeRepository.entity === EnumRepositoryKeys.hydroshare)
        this.allowFileUpload = this.isHsComposite

      if (this.hasFileExplorer) {
        console.info('[CzNewSubmission]: Reading existing files...')
        try {
          const initialStructure
            = await this.activeRepository.readRootFolder(
              this.identifier,
              '',
            )
          // @ts-expect-error The key property is generated when the component is initialized
          // TODO: this component should have a load function instead of populating the `children` object directly
          this.rootDirectory.children = initialStructure
        }
        catch (e) {
          Notifications.toast({
            message: 'Failed to load existing files.',
            type: 'error',
            location: 'top center',
          })
        }
      }

      this.isLoadingInitialFiles = false

      this.data = {
        ...this.data,
        ...this.repositoryRecord,
      }

      // Nexttick doesn't work. We use setTimeout instead.
      setTimeout(() => {
        this.hasUnsavedChanges = false
      })
    }

    // clean up
    if (this.registeringSubmission) {
      User.commit((state) => {
        state.registeringSubmission = null
      })
    }

    this.isLoading = false
  }

  onSaveAndFinish() {
    if (
      this.hasFileExplorer
      && (this.fileExplorer?.hasTooManyFiles || this.fileExplorer?.isTotalUploadSizeTooBig || this.fileExplorer?.hasInvalidFilesToUpload)
    ) {
      Notifications.openDialog({
        title: 'Some of your files cannot be uploaded',
        content: `You have selected files for upload that are invalid or cannot be uploaded at this time. Please correct any errors indicated or confirm below to ignore them and continue.`,
        confirmText: 'Continue',
        cancelText: 'Cancel',
        onConfirm: async () => {
          this._onSaveAndFinish()
        },
        onCancel: () => {
          return false
        },
      })
    }
    else {
      this._onSaveAndFinish()
    }
  }

  private async _onSaveAndFinish() {
    // In earthchem, we want to confirm if the user wants to mark the status as complete before navigating away
    if (this.activeRepository.entity === EnumRepositoryKeys.earthchem) {
      if (this.data.status === 'incomplete') {
        Notifications.openDialog({
          title: 'Are you finished with this submission?',
          content: `Do you want to submit this resource for review? If so, you will not be able to make further changes.`,
          confirmText: 'Submit for review',
          secondaryActionText: 'Finish later',
          cancelText: 'Cancel',
          onConfirm: async () => {
            this.data.status = 'submitted'
            this.hasUnsavedChanges = true
            this._saveAndFinish()
          },
          onSecondaryAction: () => {
            this._saveAndFinish()
          },
        })
      }
      else {
        this._saveAndFinish()
      }
    }
    else {
      this._saveAndFinish()
    }
  }

  onSave() {
    if (
      !this.isExternal
      && this.hasFileExplorer
      && (this.fileExplorer?.hasTooManyFiles || this.fileExplorer?.isTotalUploadSizeTooBig || this.fileExplorer?.hasInvalidFilesToUpload)
    ) {
      Notifications.openDialog({
        title: 'Some of your files cannot be uploaded',
        content: `You have selected files for upload that are invalid or cannot be uploaded at this time. Please correct any errors indicated or confirm below to ignore them and continue.`,
        confirmText: 'Continue',
        cancelText: 'Cancel',
        onConfirm: async () => {
          this._onSave()
        },
        onCancel: () => {
          return false
        },
      })
    }
    else {
      this._onSave()
    }
  }

  private async _onSave() {
    const wasSaved = await this._save()

    if (wasSaved) {
      this.hasUnsavedChanges = false

      if (!this.isEditMode) {
        // If creating, redirect to the edit page
        this.router.push({
          name: 'submit.repository',
          params: {
            repository: this.activeRepository.entity,
            id: this.identifier,
          },
        })
        // Vue-router does not reload components when redirecting the same route.
        // The only way to do it is using a `key` in a `router-view`, but we do not use a `router-view` in this page.
        // We reset the state ourselves instead
        this.init()
      }
    }
    this.isSaving = false
  }

  private async _saveAndFinish() {
    if (this.hasUnsavedChanges || this.route.query.mode === 'register') {
      const wasSaved = await this._save()

      if (wasSaved) {
        this.hasUnsavedChanges = false
        this.router.push({ name: 'submissions' })
      }
    }
    // If nothing to save, just redirect to submissions page
    else {
      this.router.push({ name: 'submissions' })
    }
  }

  private async _save() {
    this.isSaving = true
    let wasSaved = false
    let submission

    // If first time saving, create a new record
    if (!this.identifier) {
      console.info('CzNewSubmission: creating new record...')
      try {
        submission = await this.activeRepository?.createSubmission(
          this.data,
          this.repositoryKey,
        )
      }
      catch (e) {
        this.isSaving = false
        return false
      }

      if (submission?.identifier) {
        this.identifier = submission.identifier
        wasSaved = true
      }
    }
    else {
      console.info('[NewSubmission]: Saving to existing record...')
      wasSaved = await this.activeRepository?.updateSubmission(
        this.identifier,
        this.data,
      )
    }

    if (!this.isEditMode) {
      // TODO: integration changes
      if (this.hasFileExplorer && !this.fileExplorer.hasTooManyFiles && !this.fileExplorer.isTotalUploadSizeTooBig) {
        await this.uploadFiles(this.toUpload)
      }
    }
    // If we are in edit mode, files have already been saved

    if (wasSaved) {
      // Indicate that changes have been saved
      Notifications.toast({
        message: this.isEditMode
          ? 'Your changes have been saved'
          : 'Your submission has been saved!',
        type: 'success',
      })
    }
    else {
      Notifications.toast({
        message: this.isEditMode
          ? 'Your changes could not be saved'
          : 'Failed to create submission',
        type: 'error',
      })
    }

    this.isSaving = false

    return wasSaved
  }

  onUpdateErrors(errors: { title: string, message: string }[]) {
    this.errors = errors
  }

  onDataChange(_data: any) {
    // cz-form emits 'change' event multiple times during instantioation.
    const changesDuringInstantiation = 3

    if (this.timesChanged <= changesDuringInstantiation)
      this.timesChanged = this.timesChanged + 1

    this.hasUnsavedChanges = this.timesChanged > changesDuringInstantiation
  }

  async uploadFiles(files: (IFile | IFolder)[]): Promise<boolean[]> {
    const repoUrls: IRepositoryUrls | undefined
      = this.activeRepository?.get()?.urls

    if (files.length && repoUrls) {
      const url = sprintf(repoUrls.fileCreateUrl, this.identifier)

      const createFolderUrl = sprintf(
        repoUrls.folderCreateUrl || '',
        this.identifier,
        '%s', // replaced file by file inside repo model
      )
      // Annotate file paths before uploading
      files.forEach((f) => {
        f.isDisabled = true
        f.path = this.fileExplorer.getPathString(f)
      })
      return this.activeRepository?.uploadFiles(url, files, createFolderUrl)
    }
    return []
  }

  async deleteFileOrFolder(item: (IFile | IFolder)): Promise<boolean> {
    return this.activeRepository.deleteFileOrFolder?.(
      this.identifier,
      item,
    ) || true
  }

  async renameFileOrFolder(item: (IFile | IFolder), newPath: string): Promise<boolean> {
    item.path = this.fileExplorer.getPathString(item)
    return this.activeRepository.renameFileOrFolder?.(
      this.identifier,
      item,
      newPath,
    ) || true
  }

  @Hook
  beforeRouteLeave(
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
    next: NavigationGuardNext,
  ) {
    hasUnsavedChangesGuard(to, from, next)
  }
}
export default toNative(CzNewSubmission)
</script>

<style lang="scss" scoped>
.form-controls {
  button + button {
    margin-left: 1rem;
  }
}

#instructions .d-flex {
  align-items: center;
}

:deep(.v-overlay.backdrop) {
  z-index: 4 !important;
}
</style>
