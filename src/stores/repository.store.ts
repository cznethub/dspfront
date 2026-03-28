import type { RouteLocationRaw, Router } from 'vue-router'
import type { IFile, IFolder } from '@cznethub/cznet-vue-core/dist/types'
import type { IRepository, IRepositoryUrls } from '~/components/submissions/types'
import { Notifications } from '@cznethub/cznet-vue-core'
import axios from 'axios'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { Subject } from 'rxjs'
import { sprintf } from 'sprintf-js'
import { APP_URL, DELETED_RESOURCE_STATUS_CODES } from '~/constants'
import { EnumRepositoryKeys } from '~/components/submissions/types'
import { repoMetadata } from '~/components/submit/constants'
import { useUserStore } from './user.store'

const STORAGE_KEY = 'cz-hub-repositories'

// ---------------------------------------------------------------------------
// File-operation strategies per repository
// ---------------------------------------------------------------------------

async function hydroShareUploadFiles(
  bucketUrl: string,
  itemsToUpload: (IFile | IFolder)[],
  createFolderUrl: string,
  accessToken: string,
): Promise<boolean[]> {
  itemsToUpload.map(i => (i.isDisabled = true))
  const filesToUpload = itemsToUpload.filter(i => Object.prototype.hasOwnProperty.call(i, 'file')) as IFile[]
  const foldersToUpload = itemsToUpload.filter(i =>
    Object.prototype.hasOwnProperty.call(i, 'children'),
  ) as IFolder[]

  let folderPaths = foldersToUpload.map(f => f.path).filter(f => !!f) as string[]
  folderPaths = [...new Set(folderPaths)].sort(
    (a, b) => b.split('/').length - a.split('/').length,
  )

  itemsToUpload.map(i => (i.isDisabled = false))

  let responses: boolean[]
  if (folderPaths.length) {
    responses = await _createFoldersByDepth(folderPaths, 1)
  }
  else {
    responses = await _uploadFiles()
  }

  async function _createFoldersByDepth(paths: string[], depth: number): Promise<boolean[]> {
    const depthPaths = paths.filter(p => p.split('/').length === depth)
    const folderCreatePromises = depthPaths.map((path: string) => {
      const folderCreateUrl = sprintf(createFolderUrl, encodeURIComponent(path))
      return axios.put(folderCreateUrl, {}, { params: { access_token: accessToken } })
    })
    await Promise.allSettled(folderCreatePromises)
    const remaining = paths.filter(p => p.split('/').length > depth)
    return remaining.length ? _createFoldersByDepth(remaining, depth + 1) : _uploadFiles()
  }

  async function _uploadFiles(): Promise<boolean[]> {
    const fileUploadPromises = filesToUpload.map((file: IFile) => {
      let url = bucketUrl
      const form = new window.FormData()
      if (file.file)
        form.append('file', file.file, file.name)
      if (file.path?.includes('/')) {
        const pos = (file.path as string).lastIndexOf('/')
        const path = (file.path as string).substring(0, pos)
        url = `${url}${encodeURIComponent(path)}/`
      }
      return axios.post(url, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        params: { access_token: accessToken },
      })
    })

    const response: PromiseSettledResult<any>[] = await Promise.allSettled(fileUploadPromises)
    filesToUpload.forEach((f, index) => {
      // @ts-expect-error TODO: typing
      const uploadedFileName = response[index]?.value?.data?.file_name
      if (response[index].status === 'fulfilled' && uploadedFileName) {
        f.name = uploadedFileName
        f.isUploaded = true
      }
      else {
        response[index].status = 'rejected'
      }
    })

    if (response.some(r => r.status === 'rejected')) {
      Notifications.toast({ message: 'Some of your files failed to upload', type: 'error' })
    }
    return response.map(r => r.status === 'fulfilled')
  }

  return responses
}

async function hydroShareReadRootFolder(
  identifier: string,
  path: string,
  urls: IRepositoryUrls,
  accessToken: string,
): Promise<Partial<IFile | IFolder>[]> {
  return _readFolderRecursive(identifier, path, urls, accessToken)
}

async function _readFolderRecursive(
  identifier: string,
  path: string,
  urls: IRepositoryUrls,
  accessToken: string,
): Promise<Partial<IFile | IFolder>[]> {
  const url = urls.folderReadUrl || ''
  const folderReadUrl = sprintf(url, identifier, encodeURIComponent(path || ' '))

  try {
    const response = await axios.get(folderReadUrl, { params: { access_token: accessToken } })
    if (response.status === 200) {
      const files: IFile[] = response.data.files.map((fileName: string) => ({
        name: fileName,
        isUploaded: true,
        file: null,
      }))
      const folders: IFolder[] = response.data.folders.map((folderName: string) => ({
        name: folderName,
        children: [],
        isUploaded: true,
      }))

      if (folders.length) {
        const readSubfolderPromises = folders.map((f) => {
          const newPath = path ? `${path}/${f.name}` : f.name
          return _readFolderRecursive(identifier, newPath, urls, accessToken)
        })
        const responses = await Promise.all(readSubfolderPromises)
        folders.forEach((f, i) => {
          // @ts-expect-error Doesn't matter because we just need the initial structure to load the component
          f.children = responses[i] || []
        })
      }

      return [...folders, ...files]
    }
  }
  catch (e: any) {
    console.log(e)
  }
  return []
}

async function hydroShareRenameFileOrFolder(
  identifier: string,
  item: IFile | IFolder,
  newPath: string,
  urls: IRepositoryUrls,
  accessToken: string,
): Promise<boolean> {
  const pathPrefix = 'data/contents/'
  const url = urls.moveOrRenameUrl || ''
  const renameUrl = sprintf(url, identifier)
  const form = new window.FormData()
  form.append('source_path', pathPrefix + item.path)
  form.append('target_path', pathPrefix + newPath)
  try {
    const response = await axios.post(renameUrl, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      params: { access_token: accessToken },
    })
    return response.status === 200
  }
  catch {
    return false
  }
}

async function hydroShareDeleteFileOrFolder(
  identifier: string,
  item: IFile | IFolder,
  urls: IRepositoryUrls,
  accessToken: string,
): Promise<boolean> {
  const path = `${item.path ? `${item.path}/` : ''}${item.name}`
  const isFolder = Object.prototype.hasOwnProperty.call(item, 'children')
  const url = isFolder ? urls.folderDeleteUrl || '' : urls.fileDeleteUrl || ''
  const deleteUrl = sprintf(url, identifier, encodeURIComponent(path))
  try {
    const response = await axios.delete(deleteUrl, { params: { access_token: accessToken } })
    return response.status === 200 || response.status === 204
  }
  catch (e: any) {
    console.log(e)
    Notifications.toast({ message: 'Failed to delete file', type: 'error' })
  }
  return false
}

async function earthChemUploadFiles(
  bucketUrl: string,
  itemsToUpload: (IFile | IFolder)[],
  accessToken: string,
): Promise<boolean[]> {
  const response: boolean[] = []
  for (const item of itemsToUpload) {
    const message = await _earthChemUploadFile(item as IFile & { file: Blob }, bucketUrl, accessToken)
    response.push(message)
  }
  if (response.some(r => !r)) {
    Notifications.toast({ message: 'Some of your files failed to upload', type: 'error' })
  }
  return response
}

async function _earthChemUploadFile(
  file: IFile & { file: Blob },
  url: string,
  accessToken: string,
): Promise<boolean> {
  const form = new window.FormData()
  form.append('file', file.file, file.name)
  form.append('description', file.name)
  file.isDisabled = true
  try {
    const response = await axios.post(url, form, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${accessToken}`,
      },
    })
    file.isUploaded = response.status === 200
    file.serverName = response.data.serverName
    file.name = response.data.name
    file.uploadedSize = response.data.size
  }
  catch {
    file.isUploaded = false
  }
  file.isDisabled = false
  return !!file.isUploaded
}

async function earthChemReadRootFolder(
  identifier: string,
  urls: IRepositoryUrls,
  accessToken: string,
): Promise<Partial<IFile | IFolder>[]> {
  const url = urls.fileReadUrl || ''
  const folderReadUrl = sprintf(url, identifier)
  const response = await axios.get(folderReadUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (response.status === 200) {
    return response.data.map((file: any): Partial<IFile> => ({
      name: file.name,
      serverName: file.serverName,
      isUploaded: true,
      file: null,
      uploadedSize: file.size,
    }))
  }
  return []
}

async function earthChemDeleteFileOrFolder(
  identifier: string,
  item: IFile | IFolder,
  urls: IRepositoryUrls,
  accessToken: string,
): Promise<boolean> {
  const url = urls.fileDeleteUrl || ''
  const deleteUrl = sprintf(url, identifier, (item as IFile).serverName)
  try {
    const response = await axios.delete(deleteUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    return response.status === 200 || response.status === 204
  }
  catch (e: any) {
    console.log(e)
    Notifications.toast({ message: 'Failed to delete file', type: 'error' })
  }
  return false
}

// ---------------------------------------------------------------------------
// Store definition
// ---------------------------------------------------------------------------

export const useRepositoryStore = defineStore('repository', () => {
  const userStore = useUserStore()

  // --- State ---
  const submittingTo = ref<EnumRepositoryKeys | null>(null)

  // Per-repository token state (only for OAuth repos)
  const accessTokens = ref<Record<string, string>>({
    [EnumRepositoryKeys.hydroshare]: '',
    [EnumRepositoryKeys.earthchem]: '',
  })

  // Per-repository fetched data (schema, urls, etc.)
  const repositoryData = ref<Record<string, Partial<IRepository>>>({})

  // --- RxJS Subjects ---
  const authorizeDialog$ = new Subject<{ repository: string, redirectTo?: RouteLocationRaw }>()
  const authorized$ = new Subject<EnumRepositoryKeys>()

  let controller = new AbortController()

  // --- Computed ---
  const activeRepositoryKey = computed(() => submittingTo.value)

  // --- Helpers ---
  function getAccessToken(key: string): string {
    return accessTokens.value[key] ?? ''
  }

  function setAccessToken(key: string, token: string) {
    accessTokens.value[key] = token
    _persistState()
  }

  function getData(key: string): Partial<IRepository> | undefined {
    return repositoryData.value[key]
  }

  function isAuthorized(key: string): boolean {
    return key == EnumRepositoryKeys.external || !!accessTokens.value[key]
  }

  // --- Actions ---
  function openAuthorizeDialog(repository: string, redirectTo?: RouteLocationRaw) {
    authorizeDialog$.next({ repository, redirectTo })
  }

  async function init(key: EnumRepositoryKeys) {
    // Seed static metadata first
    if (repoMetadata[key]) {
      repositoryData.value[key] = { ...repoMetadata[key], ...repositoryData.value[key] }
    }

    console.info(`[${key}]: Fetching schemas...`)
    const urls = await getUrls(key)

    const [schema, uischema, schemaDefaults] = await Promise.allSettled([
      _getJson(urls?.schemaUrl),
      _getJson(urls?.uischemaUrl),
      _getJson(urls?.schemaDefaultsUrl),
    ]).then(results => results.map(r => r.status === 'fulfilled' ? r.value : undefined))

    repositoryData.value[key] = {
      ...repositoryData.value[key],
      urls,
      schema,
      uischema,
      schemaDefaults,
    }
    _persistState()
  }

  async function authorize(
    repositoryKey: EnumRepositoryKeys,
    callback?: (response?: any) => any,
  ) {
    const data = repositoryData.value[repositoryKey]
    const authorizeUrl = data?.urls?.authorizeUrl

    if (!authorizeUrl) {
      Notifications.toast({ message: 'Failed to authorize repository', type: 'error' })
      return
    }

    const handleMessage = async (event: MessageEvent) => {
      if (event.origin !== APP_URL) return

      if (Object.prototype.hasOwnProperty.call(event.data, 'error')) {
        callback?.(event.data)
        controller.abort()
        return
      }

      if (!Object.prototype.hasOwnProperty.call(event.data, 'token')) return

      if (event.data?.token) {
        setAccessToken(repositoryKey, event.data.token.access_token || '')
        controller.abort()
        callback?.()
        authorized$.next(repositoryKey)
      }
      else {
        Notifications.toast({ message: 'Failed to authorize repository', type: 'error' })
      }
    }

    window.open(`${APP_URL}${authorizeUrl}`, '_blank', 'location=1,status=1,scrollbars=1, width=800,height=800')
    controller.abort()
    controller = new AbortController()
    window.addEventListener('message', handleMessage, { signal: controller.signal })
    console.info(`[Repository]: Listening to authorization window...`)
  }

  function openRevokeDialog(repositoryKey: EnumRepositoryKeys) {
    const data = repositoryData.value[repositoryKey]
    Notifications.openDialog({
      title: 'Revoke access',
      content: 'Are you sure you want to revoke access to this repository?',
      confirmText: 'Revoke',
      cancelText: 'Cancel',
      onConfirm: async () => {
        const accessTokenUrl = data?.urls?.accessTokenUrl
        if (!accessTokenUrl) {
          Notifications.toast({ message: 'Failed to revoke access', type: 'error' })
          return
        }
        try {
          const response = await axios.delete(accessTokenUrl, {
            params: { access_token: userStore.orcidAccessToken },
          })
          if (response.status === 200) {
            setAccessToken(repositoryKey, '')
            Notifications.toast({ message: 'Access to this repository has been revoked', type: 'success' })
          }
          else {
            Notifications.toast({ message: 'Failed to revoke access to this repository', type: 'error' })
          }
        }
        catch (e) {
          console.log(e)
          Notifications.toast({ message: 'Failed to revoke access to this repository', type: 'error' })
        }
      },
    })
  }

  async function getUrls(key: string): Promise<IRepositoryUrls | undefined> {
    try {
      const response = await axios.get(`/api/urls/${key}`, {
        params: { access_token: userStore.orcidAccessToken },
      })
      return {
        schemaUrl: response.data.schema,
        uischemaUrl: response.data.uischema,
        schemaDefaultsUrl: response.data.schema_defaults,
        createUrl: response.data.create,
        updateUrl: response.data.update,
        readUrl: response.data.read,
        deleteUrl: '',
        fileCreateUrl: response.data.file_create,
        fileDeleteUrl: response.data.file_delete,
        fileReadUrl: response.data.file_read,
        folderCreateUrl: response.data.folder_create,
        folderReadUrl: response.data.folder_read,
        folderDeleteUrl: response.data.folder_delete,
        moveOrRenameUrl: response.data.move_or_rename_url,
        accessTokenUrl: response.data.access_token,
        authorizeUrl: response.data.authorize_url,
        viewUrl: response.data.view_url,
        publicViewUrl: response.data.public_view_url,
      }
    }
    catch (e) {
      console.error(`${key}: Failed to fetch repository Urls`, e)
      return undefined
    }
  }

  async function _getJson(jsonUrl: string | undefined) {
    if (!jsonUrl) return undefined
    const resp = await axios.get(jsonUrl, { params: { access_token: userStore.orcidAccessToken } })
    if (resp.status === 200) return resp.data
  }

  // --- Submission actions (moved from Repository model) ---
  async function createSubmission(
    key: EnumRepositoryKeys,
    data: any,
  ): Promise<{ identifier: string, formMetadata: any } | null> {
    console.info(`${key}: Creating submission...`)
    try {
      const response = await axios.post(`/api/metadata/${key}`, data, {
        headers: { 'Content-Type': 'application/json' },
        params: { access_token: userStore.orcidAccessToken },
      })
      if (response?.status === 201) {
        let identifier = ''
        switch (key) {
          case EnumRepositoryKeys.hydroshare:
            identifier = response.data.metadata.identifier?.split('/').pop()
            break
          case EnumRepositoryKeys.earthchem:
            identifier = response.data.metadata.id
            break
          case EnumRepositoryKeys.external:
            identifier = response.data.metadata.identifier
            break
        }
        return { identifier, formMetadata: response.data.metadata }
      }
    }
    catch (e: any) {
      if (
        e.response?.status === 401 && e.response.data?.detail?.includes('User has not authorized with')
        || e.response?.data?.includes?.('has expired and could not be refreshed')
      ) {
        _handleUnauthorized(key)
      }
      else {
        Notifications.toast({ message: 'Failed to create submission', type: 'error' })
        console.error(`${key}: failed to create submission.`, e.response)
      }
      throw e
    }
    return null
  }

  async function updateSubmission(
    key: EnumRepositoryKeys,
    identifier: string,
    data: any,
    isRegistering?: boolean,
    router?: Router,
  ): Promise<boolean> {
    try {
      const response = await axios.put(`/api/metadata/${key}/${identifier}`, data, {
        headers: { 'Content-Type': 'application/json' },
        params: { access_token: userStore.orcidAccessToken },
      })
      return response.status === 200
    }
    catch (e: any) {
      console.log(e)
      if (
        e.response?.status === 401 && e.response.data?.detail?.includes('User has not authorized with')
        || e.response?.data?.includes?.('has expired and could not be refreshed')
      ) {
        _handleUnauthorized(key)
      }
      else if (e.response?.status === 401 || e.response?.status === 403) {
        if (isRegistering && !userStore.hasUnsavedChanges) {
          await readSubmission(key, identifier)
          return true
        }

        const dialog: any = {
          title: 'Permission required',
          content: 'You do not have permission to edit this resource. Consider asking the owner of the resource to grant you access and try again.',
          cancelText: 'Cancel',
          isPersistent: true,
          onConfirm: () => { },
        }

        if (isRegistering) {
          dialog.confirmText = 'Discard Changes & Register'
          dialog.onConfirm = async () => {
            try {
              userStore.isSaving = true
              await readSubmission(key, identifier)
              userStore.isSaving = false
              userStore.hasUnsavedChanges = false
              Notifications.toast({ message: 'Your dataset has been registered!', type: 'success' })
              router?.push({ name: 'submissions' })
            }
            catch {
              userStore.isSaving = false
              userStore.hasUnsavedChanges = false
              Notifications.toast({ message: 'Failed to register dataset', type: 'error' })
            }
          }
        }

        Notifications.openDialog(dialog)
      }
      return false
    }
  }

  async function readSubmission(key: EnumRepositoryKeys, identifier: string) {
    // Import dynamically to avoid circular dependency
    const { useSubmissionStore } = await import('./submission.store')
    const submissionStore = useSubmissionStore()

    try {
      const response = await axios.get(`/api/metadata/${key}/${identifier}`, {
        params: { access_token: userStore.orcidAccessToken },
      })
      if (response.status === 200) {
        if (key !== EnumRepositoryKeys.external) {
          submissionStore.insertOrUpdate(
            submissionStore.getInsertData(response.data.metadata, key, identifier),
          )
        }
        return response.data
      }
      else {
        Notifications.toast({ message: 'Failed to load submission', type: 'error' })
        return null
      }
    }
    catch (e: any) {
      if (
        e.response?.status === 401 && e.response.data?.detail?.includes('User has not authorized with')
        || e.response?.data?.includes?.('has expired and could not be refreshed')
      ) {
        _handleUnauthorized(key)
        return e.response.status
      }
      else if (e.response?.status === 403) {
        Notifications.toast({ message: 'Failed to load submission', type: 'error' })
        return e.response.status
      }
      else if (DELETED_RESOURCE_STATUS_CODES.includes(e.response?.status)) {
        return e.response.status
      }
      else {
        console.error(`${key}: failed to read submission.`, e.response)
        return null
      }
    }
  }

  async function readExistingSubmission(key: string, identifier: string) {
    try {
      const response = await axios.get(`/api/json/${key}/${identifier}`, {
        params: { access_token: userStore.orcidAccessToken },
      })
      if (response.status === 200) return response.data
      else {
        Notifications.toast({ message: 'Failed to load existing submission', type: 'error' })
        return null
      }
    }
    catch (e: any) {
      if (e.response?.status === 401 && e.response.data.detail?.includes('User has not authorized with')) {
        _handleUnauthorized(key)
        return e.response.status
      }
      else if (e.response?.status === 403 || e.response?.status === 404) {
        return e.response.status
      }
      else if (DELETED_RESOURCE_STATUS_CODES.includes(e.response?.status)) {
        return e.response.status
      }
      else {
        console.error(`${key}: failed to read submission.`, e.response)
        return null
      }
    }
  }

  async function refetchSubmission(identifier: string, key: EnumRepositoryKeys) {
    const { useSubmissionStore } = await import('./submission.store')
    const submissionStore = useSubmissionStore()

    try {
      const response = await axios.get(`/api/submission/${key}/${identifier}`, {
        params: { access_token: userStore.orcidAccessToken },
      })
      if (key !== EnumRepositoryKeys.external) {
        submissionStore.insertOrUpdate(submissionStore.getInsertDataFromDb(response.data))
      }
      Notifications.toast({ message: 'Your submission has been reloaded with its latest changes', type: 'success' })
    }
    catch (e: any) {
      console.log(e)
      if (
        e.response?.status === 401 && e.response.data?.detail?.includes('User has not authorized with')
        || e.response?.data?.includes?.('has expired and could not be refreshed')
      ) {
        _handleUnauthorized(key)
      }
      else if (DELETED_RESOURCE_STATUS_CODES.includes(e.response?.status)) {
        Notifications.openDialog({
          title: 'This resource has been deleted',
          content: 'The resource you requested does not exist in the remote repository. It may have been deleted outside of the Data Submission Portal. Do you want to remove it from your list of submissions?',
          confirmText: 'Remove',
          confirmTextColor: 'red',
          cancelText: 'Cancel',
          onConfirm: async () => { await deleteSubmission(identifier, key) },
        })
      }
      else {
        console.error(`${key}: failed to update submission.`, e.response)
        Notifications.toast({ message: 'Failed to update record', type: 'error' })
      }
    }
  }

  async function deleteSubmission(identifier: string, key: string, deleteInRepository?: boolean) {
    const { useSubmissionStore } = await import('./submission.store')
    const submissionStore = useSubmissionStore()

    try {
      const deleteUrl = deleteInRepository
        ? `/api/metadata/${key}/${identifier}`
        : `/api/submit/${key}/${identifier}`

      const response = await axios.delete(deleteUrl, {
        params: { access_token: userStore.orcidAccessToken },
      })

      if (response.status === 200) {
        submissionStore.remove(identifier, key)
        Notifications.toast({ message: 'Your submission has been deleted', type: 'success' })
      }
    }
    catch (e: any) {
      if (
        e.response?.status === 401 && e.response.data?.detail?.includes('User has not authorized with')
        || e.response?.data?.includes?.('has expired and could not be refreshed')
      ) {
        _handleUnauthorized(key)
      }
      else if (e.response?.status === 403) {
        submissionStore.remove(identifier, key)
        Notifications.toast({ message: 'Your submission could not be deleted from the repository.', type: 'info' })
      }
      else if (DELETED_RESOURCE_STATUS_CODES.includes(e.response?.status)) {
        submissionStore.remove(identifier, key)
        Notifications.toast({ message: 'Your submission has been deleted', type: 'success' })
      }
      else {
        console.error(`${key}: failed to delete submission.`, e.response)
        Notifications.toast({ message: 'Failed to delete submission', type: 'error' })
      }
    }
  }

  // --- File operations (dispatched by repository key) ---
  async function uploadFiles(
    key: EnumRepositoryKeys,
    bucketUrl: string,
    itemsToUpload: (IFile | IFolder)[],
    createFolderUrl: string,
  ): Promise<boolean[]> {
    const token = getAccessToken(key)
    switch (key) {
      case EnumRepositoryKeys.hydroshare:
        return hydroShareUploadFiles(bucketUrl, itemsToUpload, createFolderUrl, token)
      case EnumRepositoryKeys.earthchem:
        return earthChemUploadFiles(bucketUrl, itemsToUpload, token)
      default:
        return []
    }
  }

  async function readRootFolder(
    key: EnumRepositoryKeys,
    identifier: string,
    path: string,
  ): Promise<Partial<IFile | IFolder>[]> {
    const token = getAccessToken(key)
    const urls = repositoryData.value[key]?.urls
    if (!urls) return []
    switch (key) {
      case EnumRepositoryKeys.hydroshare:
        return hydroShareReadRootFolder(identifier, path, urls, token)
      case EnumRepositoryKeys.earthchem:
        return earthChemReadRootFolder(identifier, urls, token)
      default:
        return []
    }
  }

  async function deleteFileOrFolder(
    key: EnumRepositoryKeys,
    identifier: string,
    item: IFile | IFolder,
  ): Promise<boolean> {
    const token = getAccessToken(key)
    const urls = repositoryData.value[key]?.urls
    if (!urls) return false
    switch (key) {
      case EnumRepositoryKeys.hydroshare:
        return hydroShareDeleteFileOrFolder(identifier, item, urls, token)
      case EnumRepositoryKeys.earthchem:
        return earthChemDeleteFileOrFolder(identifier, item, urls, token)
      default:
        return false
    }
  }

  async function renameFileOrFolder(
    key: EnumRepositoryKeys,
    identifier: string,
    item: IFile | IFolder,
    newPath: string,
  ): Promise<boolean> {
    const token = getAccessToken(key)
    const urls = repositoryData.value[key]?.urls
    if (!urls) return false
    switch (key) {
      case EnumRepositoryKeys.hydroshare:
        return hydroShareRenameFileOrFolder(identifier, item, newPath, urls, token)
      default:
        return false
    }
  }

  function _handleUnauthorized(key: string) {
    setAccessToken(key, '')
  }

  // --- Persistence ---
  function _loadPersistedState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const data = JSON.parse(raw)
        if (data.accessTokens) {
          Object.assign(accessTokens.value, data.accessTokens)
        }
        if (data.repositoryData) {
          Object.assign(repositoryData.value, data.repositoryData)
        }
        if (data.submittingTo !== undefined) {
          submittingTo.value = data.submittingTo
        }
      }
    }
    catch {
      // Ignore corrupted storage
    }
  }

  function _persistState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      accessTokens: accessTokens.value,
      repositoryData: repositoryData.value,
      submittingTo: submittingTo.value,
    }))
  }

  _loadPersistedState()

  return {
    // State
    submittingTo,
    accessTokens,
    repositoryData,

    // Computed
    activeRepositoryKey,

    // Subjects
    authorizeDialog$,
    authorized$,

    // Helpers
    getAccessToken,
    setAccessToken,
    getData,
    isAuthorized,

    // Actions
    init,
    authorize,
    openAuthorizeDialog,
    openRevokeDialog,
    getUrls,
    createSubmission,
    updateSubmission,
    readSubmission,
    readExistingSubmission,
    refetchSubmission,
    deleteSubmission,

    // File operations
    uploadFiles,
    readRootFolder,
    deleteFileOrFolder,
    renameFileOrFolder,

    // Persistence
    _persistState,
  }
})

export function piniaRepositoryPersistPlugin({ store }: { store: any }) {
  if (store.$id === 'repository') {
    store.$subscribe(() => {
      store._persistState()
    })
  }
}
