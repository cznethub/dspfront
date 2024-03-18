import axios from 'axios'
import { Notifications } from '@cznethub/cznet-vue-core'
import { sprintf } from 'sprintf-js'
import Repository from './repository.model'
import { EnumRepositoryKeys } from '~/components/submissions/types'
import type { IFile, IFolder } from '~/components/new-submission/types'

export default class Zenodo extends Repository {
  static entity = EnumRepositoryKeys.zenodo
  static baseEntity = 'repository'

  static state() {
    return {
      ...super.state(),
    }
  }

  static async uploadFiles(
    bucketUrl: string,
    itemsToUpload: (IFile | IFolder)[] | any[],
    _createFolderUrl: string,
  ) {
    const uploadPromises: Promise<boolean>[] = itemsToUpload.map((file) => {
      return this._uploadFile(file, bucketUrl)
    })

    const response = await Promise.allSettled(uploadPromises)

    itemsToUpload.map((f, index) => {
      if (response[index].status !== 'fulfilled') {
        // Uplaod failed for this file
        f.parent.children = f.parent.children.filter(
          file => file.name !== f.name,
        )
      }
    })

    // TODO: figure out how to identify that fail was due to a name that already exists
    if (response.some(r => r.status === 'rejected')) {
      Notifications.toast({
        message: 'Some of your files failed to upload',
        type: 'error',
      })
    }
  }

  private static async _uploadFile(file: IFile, url: string) {
    const form = new window.FormData()

    // Make sure the file itself has our resolved name
    // Object.defineProperty(file.file, 'name', {
    //   writable: true,
    //   value: file.name
    // })

    form.append('file', file.file as File, file.name)

    file.isDisabled = true
    const response = await axios.post(url, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      params: { access_token: this.accessToken },
    })
    file.isDisabled = false
    file.key = response.data.id
    file.isUploaded = response.status === 201

    return response.status === 201
  }

  static async readRootFolder(
    identifier: string,
    path: string,
    rootDirectory: IFolder,
  ): Promise<(IFile | IFolder)[]> {
    const url = this.get()?.urls?.fileReadUrl
    const folderReadUrl = sprintf(
      url,
      identifier,
      // encodeURIComponent(path || '')
    )

    const response = await axios.get(folderReadUrl, {
      params: { access_token: this.accessToken },
    })
    if (response.status === 200) {
      const files: IFile[] = response.data.map((file: any): IFile => {
        return {
          name: file.filename,
          parent: rootDirectory,
          isRenaming: false,
          isCutting: false,
          isDisabled: false,
          isUploaded: true,
          key: file.id,
          path,
          uploadedSize: file.filesize,
          file: null,
        }
      })

      return files
    }

    return []
  }

  static async renameFileOrFolder(
    identifier: string,
    item: IFile | IFolder,
    newPath: string,
  ): Promise<boolean> {
    // TODO: zenodo api throws an error when trying to rename the same file more than once
    // https://github.com/zenodo/zenodo/issues/2342
    const url = this.get()?.urls?.moveOrRenameUrl
    const renameUrl = sprintf(url, identifier, item.key)
    const newName = newPath.split('/').pop()

    if (!newName)
      return false

    try {
      const response = await axios.put(
        renameUrl,
        { filename: newName },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          params: { access_token: this.accessToken },
        },
      )

      return response.status === 200
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
    const url = this.get()?.urls?.fileDeleteUrl
    const deleteUrl = sprintf(url, identifier, item.name) // Zenodo delete file endpoint uses the file name. Their documentation is wrong (does not use file id).

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
}
