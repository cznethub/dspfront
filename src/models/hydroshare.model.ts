import axios from 'axios'
import { Notifications } from '@cznethub/cznet-vue-core'
import { sprintf } from 'sprintf-js'
import type { IFile, IFolder } from '@cznethub/cznet-vue-core/dist/types'
import Repository from './repository.model'
import { EnumRepositoryKeys } from '~/components/submissions/types'

export default class HydroShare extends Repository {
  static entity = EnumRepositoryKeys.hydroshare
  static baseEntity = 'repository'

  static state() {
    return {
      ...super.state(),
    }
  }

  static async uploadFiles(
    bucketUrl: string,
    itemsToUpload: (IFile | IFolder)[],
    createFolderUrl: string,
  ): Promise<boolean[]> {
    itemsToUpload.map(i => (i.isDisabled = true))
    const filesToUpload = itemsToUpload.filter(i => Object.prototype.hasOwnProperty.call(i, 'file')) as IFile[]
    const foldersToUpload = itemsToUpload.filter(i =>
      Object.prototype.hasOwnProperty.call(i, 'children'),
    ) as IFolder[]

    // TODO: compute folder paths
    let folderPaths = foldersToUpload.map(
      f => f.path,
    ).filter(f => !!f) as string[]

    // Get unique paths
    folderPaths = [...new Set(folderPaths)].sort(
      (a, b) => b.split('/').length - a.split('/').length,
    )

    // HydroShare can only create multiple folders at a time if the parent folder already exists
    // So we traverse the tree by depth and create folders in each depth at a time
    const that = this
    let responses
    itemsToUpload.map(i => (i.isDisabled = false))

    if (folderPaths.length) {
      // Create folders
      responses = await _createFoldersByDepth(folderPaths, 1)
    }
    else {
      // No folders to create. Just upload files directly.
      responses = await _uploadFiles()
    }

    async function _createFoldersByDepth(paths: string[], depth: number): Promise<boolean[]> {
      const depthPaths = paths.filter(p => p.split('/').length === depth)

      const folderCreatePromises = depthPaths.map((path: string) => {
        const folderCreateUrl = sprintf(
          createFolderUrl,
          encodeURIComponent(path),
        )

        return axios.put(
          folderCreateUrl,
          {},
          {
            // headers: { 'Content-Type': 'multipart/form-data', },
            params: { access_token: that.accessToken },
          },
        )
      })
      await Promise.allSettled(folderCreatePromises)
      const remaining = paths.filter(p => p.split('/').length > depth)

      return remaining.length
        ? _createFoldersByDepth(remaining, depth + 1)
        : _uploadFiles() // Finished creating folders. Files can be added.
    }

    async function _uploadFiles(): Promise<boolean[]> {
      const fileUploadPromises = filesToUpload.map((file: IFile) => {
        let url = bucketUrl
        const form = new window.FormData()
        if (file.file)
          form.append('file', file.file, file.name)

        // Check if the file is in a folder
        if (file.path?.includes('/')) {
          // We need the file path without its file name
          const pos = (file.path as string).lastIndexOf('/')
          const path = (file.path as string).substring(0, pos)
          url = `${url}${encodeURIComponent(path)}/`
        }

        return axios.post(url, form, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          params: { access_token: that.accessToken },
        })
      })

      const response: PromiseSettledResult<any>[] = await Promise.allSettled(
        fileUploadPromises,
      )

      // HydroShare replaces spaces with '_' when uploading files. We must update the name here with their changes.
      filesToUpload.forEach((f, index) => {
        // @ts-expect-error TODO: typing
        const uploadedFileName = response[index].value.data.file_name
        if (response[index].status === 'fulfilled' && uploadedFileName) {
          f.name = uploadedFileName
          f.isUploaded = true
        }
        else {
          // Uplaod failed for this file
          response[index].status = 'rejected' // TODO: (bug) HydroShare erroneously sends status 'fulfilled' if upload failed because file was too big
          // f.parent.children = f.parent.children.filter(
          //   file => file.name !== f.name,
          // )
        }
      })

      // TODO: figure out how to identify that fail was due to a name that already exists
      if (response.some(r => r.status === 'rejected')) {
        Notifications.toast({
          message: 'Some of your files failed to upload',
          type: 'error',
        })
      }

      return response.map(r => r.status === 'fulfilled')
    }

    return responses
  }

  static async readRootFolder(
    identifier: string,
    path: string,
  ): Promise<(Partial<IFile | IFolder>)[]> {
    return this._readFolderRecursive(identifier, path)
  }

  static async renameFileOrFolder(
    identifier: string,
    item: IFile | IFolder,
    newPath: string,
  ): Promise<boolean> {
    const pathPrefix = 'data/contents/'
    const url = this.get()?.urls?.moveOrRenameUrl || ''
    const renameUrl = sprintf(url, identifier)
    const form = new window.FormData()

    form.append(
      'source_path',
      pathPrefix + (item.path),
    )
    form.append('target_path', pathPrefix + newPath)
    try {
      const response = await axios.post(renameUrl, form, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        params: { access_token: this.accessToken },
      })

      if (response.status === 200)
        return true

      return false
    }
    catch (e: any) {
      console.log(e)
      return false
    }
  }

  static async deleteFileOrFolder(
    identifier: string,
    item: IFile | IFolder,
  ): Promise<boolean> {
    const path = `${item.path ? `${item.path}/` : ''}${item.name}`
    const isFolder = Object.prototype.hasOwnProperty.call(item, 'children')
    const url = isFolder
      ? this.get()?.urls?.folderDeleteUrl || ''
      : this.get()?.urls?.fileDeleteUrl || ''
    const deleteUrl = sprintf(url, identifier, encodeURIComponent(path))

    try {
      const response = await axios.delete(deleteUrl, {
        params: { access_token: this.accessToken },
      })

      return response.status === 200 || response.status === 204
    }
    catch (e: any) {
      console.log(e)
      Notifications.toast({
        message: 'Failed to delete file',
        type: 'error',
      })
    }

    return false
  }

  private static async _readFolderRecursive(
    identifier: string,
    path: string,
  ): Promise<(Partial<IFile | IFolder>)[]> {
    const url = this.get()?.urls?.folderReadUrl || ''
    const folderReadUrl = sprintf(
      url,
      identifier,
      encodeURIComponent(path || ' '), // HydroShare accepts ' ' to indicate root directory
    )

    try {
      const response = await axios.get(folderReadUrl, {
        params: { access_token: this.accessToken },
      })

      if (response.status === 200) {
        // TODO: Request file metadata to be returned in HydroShare API. Use it to populate file uploaded size below.
        const files: IFile[] = response.data.files.map(
          (fileName: string, _index: number) => {
            return {
              name: fileName,
              isUploaded: true,
              file: null,
            }
          },
        )

        const folders: IFolder[] = response.data.folders.map(
          (folderName: string, _index: number) => {
            return {
              name: folderName,
              children: [],
              isUploaded: true,
            }
          },
        )

        if (folders.length) {
          const readSubfolderPromises: Promise<(Partial<IFile | IFolder>)[]>[]
            = folders.map((f) => {
              const newPath = path ? `${path}/${f.name}` : f.name
              return this._readFolderRecursive(identifier, newPath)
            })
          const responses = await Promise.all(
            readSubfolderPromises,
          )

          folders.forEach((f, i) => {
            // @ts-expect-error Doesn't matter because we just need the initial structure to load the component. The keys will be generated then.
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
}
