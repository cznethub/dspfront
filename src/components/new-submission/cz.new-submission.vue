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
          <div class="font-weight-bold">Instructions</div>
          <p>
            Fill in the required fields (marked with * and highlighted in red).
            Press the "Save / Finish" button to upload your submission.
          </p>
        </div>

        <v-img
          class="my-4 flex-grow-0 ml-md-4 ml-0"
          :src="activeRepoData?.logoSrc"
          :alt="activeRepoData?.name"
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
      :is-edit-mode="!!isEditMode"
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
          :delete-file-or-folder="
            isEditMode && hasDeleteFileOrFolder
              ? deleteFileOrFolder
              : undefined
          "
          :rename-file-or-folder="
            isEditMode && hasRenameFileOrFolder
              ? renameFileOrFolder
              : undefined
          "
          :file-name-regex="fileNameRegex"
          :folder-name-regex="folderNameRegex"
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
        :is-edit-mode="!!isEditMode"
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
              <v-btn color="primary" @click="openAuthorizePopup(repositoryKey)">
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
                <v-icon class="mr-2"> fab fa-orcid </v-icon>
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
          <v-progress-linear indeterminate color="white" class="mb-0" />
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-overlay v-if="isSaving" class="backdrop" absolute />
  </v-container>
</template>

<script setup lang="ts">
import type { IFile, IFolder } from '@cznethub/cznet-vue-core/dist/types'
import type { IRepositoryUrls } from '../submissions/types'
import { CzFileExplorer, CzForm, Notifications } from '@cznethub/cznet-vue-core'
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { Subscription } from 'rxjs'
import { sprintf } from 'sprintf-js'
import { onBeforeRouteLeave, useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import CzNewSubmissionActions from '~/components/new-submission/cz.new-submission-actions.vue'
import { DELETED_RESOURCE_STATUS_CODES } from '~/constants'
import { hasUnsavedChangesGuard } from '~/guards'
import { useUserStore } from '~/stores/user.store'
import { useRepositoryStore } from '~/stores/repository.store'
import { useSubmissionStore } from '~/stores/submission.store'
import { EnumRepositoryKeys } from '../submissions/types'
import { repoMetadata } from '../submit/constants'

const userStore = useUserStore()
const repositoryStore = useRepositoryStore()
const submissionStore = useSubmissionStore()
const route = useRoute()
const router = useRouter()
const { t } = useI18n()

const fileExplorer = ref<InstanceType<typeof CzFileExplorer>>()

const rootDirectory = reactive<Partial<IFolder>>({ name: 'root', children: [] })
const isValid = ref(false)
const isLoading = ref(false)
const isLoadingInitialFiles = ref(false)
const identifier = ref('')
const data = ref<any>({})
const toUpload = ref<(IFile | IFolder)[]>([])
const errors = ref<{ title: string; message: string }[]>([])
const repositoryRecord = ref<any>(null)
const timesChanged = ref(0)
const wasUnauthorized = ref(false)
const allowFileUpload = ref(true)
const repositoryKey = ref<EnumRepositoryKeys>(EnumRepositoryKeys.external)
const isRegistering = ref(false)
const fileExplorerConfig = reactive({ isReadOnly: false, hasFolders: false })

let loggedInSubject = new Subscription()
let authorizedSubject = new Subscription()

// --- Computed state from stores ---
const activeRepoData = computed(() => repositoryStore.getData(repositoryKey.value))

const hasUnsavedChanges = computed({
  get: () => userStore.hasUnsavedChanges,
  set: (v: boolean) => { userStore.hasUnsavedChanges = v },
})

const isSaving = computed({
  get: () => userStore.isSaving,
  set: (v: boolean) => { userStore.isSaving = v },
})

const isLoggedIn = computed(() => userStore.isLoggedIn)
const registeringSubmission = computed(() => userStore.registeringSubmission)

const dbSubmission = computed(() => {
  const id = route.params.id?.toString()
  return submissionStore.find(id, 'hydroshare')
})

const isHsCollection = computed(() => dbSubmission.value?.metadata.type === 'CollectionResource')
const isHsComposite = computed(() => dbSubmission.value?.metadata.type === 'CompositeResource')

const isPublished = computed(() => {
  if (repositoryKey.value === EnumRepositoryKeys.hydroshare)
    return !!dbSubmission.value?.metadata.published
  else if (repositoryKey.value === EnumRepositoryKeys.earthchem)
    return dbSubmission.value?.metadata.status === 'published'
  return false
})

const repositoryUrl = computed(() => dbSubmission.value?.url)
const isEditMode = computed(() => route.params.id?.length)
const isExternal = computed(() => repoMetadata[repositoryKey.value]?.isExternal)

const hasFileExplorer = computed(
  () => wasLoaded.value && !isExternal.value && !isHsCollection.value,
)

const schema = computed(() => activeRepoData.value?.schema)
const uiSchema = computed(() => activeRepoData.value?.uischema || undefined)
const schemaDefaults = computed(() => activeRepoData.value?.schemaDefaults)
const supportedFileTypes = computed(() => repoMetadata[repositoryKey.value]?.supportedFileTypes)
const fileNameRegex = computed(() => repoMetadata[repositoryKey.value]?.fileNameRegex)
const folderNameRegex = computed(() => repoMetadata[repositoryKey.value]?.folderNameRegex)

const config = computed(() => ({
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
  isReadOnly: isPublished.value || isHsCollection.value,
}))

const isDevMode = false

const formTitle = computed(() => {
  if (isExternal.value) return 'Register Dataset from External Repository'
  return isEditMode.value ? 'Edit Submission' : `Submit to ${activeRepoData.value?.name}`
})

const submitText = computed(() => (isEditMode.value ? 'Save Changes' : 'Save'))

const wasLoaded = computed(() => (isEditMode.value ? !!repositoryRecord.value : true))

// File op availability
const hasDeleteFileOrFolder = computed(() =>
  [EnumRepositoryKeys.hydroshare, EnumRepositoryKeys.earthchem].includes(repositoryKey.value),
)
const hasRenameFileOrFolder = computed(() =>
  repositoryKey.value === EnumRepositoryKeys.hydroshare,
)

// --- Functions ---
function onLogIn() {
  userStore.logIn()
}

function goToSubmissions() {
  router.push({ name: 'submissions' })
}

function openAuthorizePopup(key: string) {
  repositoryStore.openAuthorizeDialog(key)
}

async function init() {
  isLoading.value = true
  data.value = schemaDefaults.value || {}
  timesChanged.value = 0
  hasUnsavedChanges.value = false
  wasUnauthorized.value = false
  isSaving.value = false
  repositoryKey.value = route.params.repository as EnumRepositoryKeys
  isRegistering.value = route.query.mode === 'register'

  if (!repositoryStore.getData(repositoryKey.value)?.key) {
    if (Object.values(EnumRepositoryKeys).includes(repositoryKey.value)) {
      repositoryStore.submittingTo = repositoryKey.value
      repositoryStore._persistState()
    }
  }

  fileExplorerConfig.hasFolders = repositoryKey.value === EnumRepositoryKeys.hydroshare

  if (isEditMode.value) {
    identifier.value = route.params.id?.toString() || ''
    await loadSavedSubmission()
  }
  else {
    isLoading.value = false
  }
}

async function loadSavedSubmission() {
  console.info('[CzNewSubmission]: Reading existing record...')
  const response = isRegistering.value
    ? registeringSubmission.value
      ? { metadata: registeringSubmission.value }
      : await repositoryStore.readExistingSubmission(repositoryKey.value, identifier.value)
    : await repositoryStore.readSubmission(repositoryKey.value, identifier.value)

  if (response === 401) {
    wasUnauthorized.value = true
    authorizedSubject = repositoryStore.authorized$.subscribe(async () => {
      isLoading.value = true
      await loadSavedSubmission()
    })
  }
  else if (response === 403) {
    repositoryRecord.value = null
    if (!isLoggedIn.value) {
      loggedInSubject = userStore.loggedIn$.subscribe(async () => {
        isLoading.value = true
        await loadSavedSubmission()
      })
    }
  }
  else if (DELETED_RESOURCE_STATUS_CODES.includes(response)) {
    repositoryRecord.value = null
    Notifications.openDialog({
      title: 'This resource has been deleted',
      content: `The resource you requested does not exist in the remote repository. It may have been deleted outside of the ${t('portalName')}. Do you want to remove it from your list of submissions?`,
      confirmText: 'Remove',
      cancelText: 'Cancel',
      onConfirm: async () => {
        await repositoryStore.deleteSubmission(identifier.value, repositoryKey.value)
        router.push({ name: 'submissions' })
      },
    })
  }
  else {
    repositoryRecord.value = response?.metadata
    wasUnauthorized.value = false
  }

  if (repositoryRecord.value) {
    Object.keys(repositoryRecord.value).forEach((key) => {
      if (repositoryRecord.value[key] === null)
        repositoryRecord.value[key] = undefined
    })

    if (repositoryKey.value === EnumRepositoryKeys.hydroshare)
      allowFileUpload.value = isHsComposite.value

    if (hasFileExplorer.value) {
      console.info('[CzNewSubmission]: Reading existing files...')
      try {
        const initialStructure = await repositoryStore.readRootFolder(
          repositoryKey.value,
          identifier.value,
          '',
        )
        // @ts-expect-error The key property is generated when the component is initialized
        rootDirectory.children = initialStructure
      }
      catch {
        Notifications.toast({ message: 'Failed to load existing files.', type: 'error', location: 'top center' })
      }
    }

    isLoadingInitialFiles.value = false

    data.value = { ...data.value, ...repositoryRecord.value }

    setTimeout(() => {
      hasUnsavedChanges.value = false
    })
  }

  if (registeringSubmission.value) {
    userStore.registeringSubmission = null
  }

  isLoading.value = false
}

function onSaveAndFinish() {
  if (
    hasFileExplorer.value
    && (fileExplorer.value?.hasTooManyFiles || fileExplorer.value?.isTotalUploadSizeTooBig || fileExplorer.value?.hasInvalidFilesToUpload)
  ) {
    Notifications.openDialog({
      title: 'Some of your files cannot be uploaded',
      content: 'You have selected files for upload that are invalid or cannot be uploaded at this time. Please correct any errors indicated or confirm below to ignore them and continue.',
      confirmText: 'Continue',
      cancelText: 'Cancel',
      onConfirm: async () => { _onSaveAndFinish() },
      onCancel: () => false,
    })
  }
  else {
    _onSaveAndFinish()
  }
}

async function _onSaveAndFinish() {
  if (repositoryKey.value === EnumRepositoryKeys.earthchem) {
    if (data.value.status === 'incomplete') {
      Notifications.openDialog({
        title: 'Are you finished with this submission?',
        content: 'Do you want to submit this resource for review? If so, you will not be able to make further changes.',
        confirmText: 'Submit for review',
        secondaryActionText: 'Finish later',
        cancelText: 'Cancel',
        onConfirm: async () => {
          data.value.status = 'submitted'
          hasUnsavedChanges.value = true
          _saveAndFinish()
        },
        onSecondaryAction: () => { _saveAndFinish() },
      })
    }
    else {
      _saveAndFinish()
    }
  }
  else {
    _saveAndFinish()
  }
}

function onSave() {
  if (
    !isExternal.value
    && hasFileExplorer.value
    && (fileExplorer.value?.hasTooManyFiles || fileExplorer.value?.isTotalUploadSizeTooBig || fileExplorer.value?.hasInvalidFilesToUpload)
  ) {
    Notifications.openDialog({
      title: 'Some of your files cannot be uploaded',
      content: 'You have selected files for upload that are invalid or cannot be uploaded at this time. Please correct any errors indicated or confirm below to ignore them and continue.',
      confirmText: 'Continue',
      cancelText: 'Cancel',
      onConfirm: async () => { _onSave() },
      onCancel: () => false,
    })
  }
  else {
    _onSave()
  }
}

async function _onSave() {
  const wasSaved = await _save()

  if (wasSaved) {
    hasUnsavedChanges.value = false

    if (!isEditMode.value) {
      router.push({
        name: 'register-data.repository',
        params: { repository: repositoryKey.value, id: identifier.value },
      })
      init()
    }
  }
  isSaving.value = false
}

async function _saveAndFinish() {
  if (hasUnsavedChanges.value || isRegistering.value) {
    const wasSaved = await _save()
    if (wasSaved) {
      hasUnsavedChanges.value = false
      router.push({ name: 'submissions' })
    }
  }
  else {
    router.push({ name: 'submissions' })
  }
}

async function _save(): Promise<boolean> {
  isSaving.value = true
  let wasSaved = false

  if (!identifier.value) {
    console.info('CzNewSubmission: creating new record...')
    try {
      const submission = await repositoryStore.createSubmission(repositoryKey.value, data.value)
      if (submission?.identifier) {
        identifier.value = submission.identifier
        wasSaved = true
      }
    }
    catch {
      isSaving.value = false
      return false
    }
  }
  else {
    console.info('[NewSubmission]: Saving to existing record...')
    wasSaved = await repositoryStore.updateSubmission(
      repositoryKey.value,
      identifier.value,
      data.value,
      isRegistering.value,
      router,
    )
  }

  if (!isEditMode.value) {
    if (hasFileExplorer.value && fileExplorer.value && !fileExplorer.value.hasTooManyFiles && !fileExplorer.value.isTotalUploadSizeTooBig) {
      await uploadFiles(toUpload.value)
    }
  }

  if (wasSaved) {
    Notifications.toast({
      message: isEditMode.value ? 'Your changes have been saved' : 'Your submission has been saved!',
      type: 'success',
    })
  }
  else {
    Notifications.toast({
      message: isEditMode.value ? 'Your changes could not be saved' : 'Failed to create submission',
      type: 'error',
    })
  }

  isSaving.value = false
  return wasSaved
}

function onUpdateErrors(newErrors: { title: string; message: string }[]) {
  errors.value = newErrors
}

function onDataChange(_d: any) {
  const changesDuringInstantiation = 3
  if (timesChanged.value <= changesDuringInstantiation)
    timesChanged.value++
  hasUnsavedChanges.value = timesChanged.value > changesDuringInstantiation
}

async function uploadFiles(files: (IFile | IFolder)[]): Promise<boolean[]> {
  const repoUrls: IRepositoryUrls | undefined = activeRepoData.value?.urls
  if (files.length && repoUrls && fileExplorer.value) {
    const url = sprintf(repoUrls.fileCreateUrl, identifier.value)
    const createFolderUrl = sprintf(
      repoUrls.folderCreateUrl || '',
      identifier.value,
      '%s',
    )
    files.forEach((f) => {
      f.isDisabled = true
      f.path = fileExplorer.value!.getPathString(f)
    })
    return repositoryStore.uploadFiles(repositoryKey.value, url, files, createFolderUrl)
  }
  return []
}

async function deleteFileOrFolder(item: IFile | IFolder): Promise<boolean> {
  return repositoryStore.deleteFileOrFolder(repositoryKey.value, identifier.value, item)
}

async function renameFileOrFolder(item: IFile | IFolder, newPath: string): Promise<boolean> {
  if (fileExplorer.value) item.path = fileExplorer.value.getPathString(item)
  return repositoryStore.renameFileOrFolder(repositoryKey.value, identifier.value, item, newPath)
}

onMounted(() => {
  init()
})

onBeforeUnmount(() => {
  loggedInSubject.unsubscribe()
  authorizedSubject.unsubscribe()
})

onBeforeRouteLeave((to, from, next) => {
  hasUnsavedChangesGuard(to, from, next)
})
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
