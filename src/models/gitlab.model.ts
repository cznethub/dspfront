import { EnumRepositoryKeys } from '@/components/submissions/types'
import { IFile, IFolder } from '@/components/new-submission/types'
import axios from "axios"
import Repository from './repository.model'
import CzNotification from './notifications.model'
import User from "@/models/user.model";

const sprintf = require("sprintf-js").sprintf

export default class GitLab extends Repository {
  static entity = EnumRepositoryKeys.gitlab
  static baseEntity = 'repository'

  static state() {
    return {
      ...super.state(),
    }
  }

  static async uploadFiles(bucketUrl: string, itemsToUpload: (IFile | IFolder)[] | any[], createFolderUrl: string) {
    async function _uploadFile(file, accessToken) {
      const url = bucketUrl // new api
      const form = new window.FormData()
      form.append('file', file.file, file.name)

      file.isDisabled = true
      const response = await axios.post(
        url,
        form,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          params: { "access_token": accessToken }
        }
      )
      file.isDisabled = false

      if (response.status === 200) {
        return true
      }

      return false
    }

    const uploadPromises: Promise<boolean>[] = itemsToUpload.map((file) => {
      return _uploadFile(file, User.$state.orcidAccessToken)
    })

    const response = await Promise.allSettled(uploadPromises)
  }

  static async readRootFolder(identifier: string, path: string, rootDirectory: IFolder): Promise<(IFile | IFolder)[]> {
    return this._readFolderRecursive(identifier, path, rootDirectory)
  }

  private static async _readFolderRecursive(identifier: string, path: string, folder: IFolder): Promise<(IFile | IFolder)[]> {
    const url = this.get()?.urls?.folderReadUrl
    const folderReadUrl = sprintf(
      url,
      identifier,
      encodeURIComponent(path || ' ') // HydroShare accepts ' ' to indicate root directory
    )

    try {
      const response = await axios.get(
        folderReadUrl,
        { params: { "access_token": User.$state.orcidAccessToken, "path": path} }
      )

      if (response.status === 200) {
        const files: IFile[] = response.data.files.map((f: any, index: number): IFile => {
          return {
            name: f.name,
            parent: folder,
            isRenaming: false,
            isCutting: false,
            isDisabled: false,
            key: `${Date.now().toString()}-a-${index}`,
            path: path,
            file: null,
          }
        })

        const folders: IFolder[] = response.data.folders.map((f: any, index: number): IFolder => {
          return {
            name: f.name,
            parent: folder,
            isRenaming: false,
            isCutting: false,
            isDisabled: false,
            key: `${Date.now().toString()}-b-${index}`,
            path: path,
            children: [],
          }
        })

        if (folders.length) {
          console.log(folders)
          const readSubfolderPromises: (Promise<(IFile | IFolder)[]>)[] = folders.map((f: IFolder) => {
            const newPath = path ? `${path}/${f.name}` : f.name
            return this._readFolderRecursive(identifier, newPath, f)
          })
          const responses: (IFile | IFolder)[][] = await Promise.all(readSubfolderPromises)

          folders.map((f, i) => {
            f.children = responses[i] || []
          })
        }

        return [...folders, ...files]
      }
    }
    catch(e: any) {
      console.log(e)
    }

    return []
  }

  static async renameFileOrFolder(identifier: string, item: IFile | IFolder, newPath: string): Promise<boolean> {
    const url = this.get()?.urls?.moveOrRenameUrl
    const renameUrl = sprintf(url, identifier, item.key)

    const form = new window.FormData()

    const newName = newPath.split('/').pop()
    if (!newName) {
      return false
    }
    form.append('filename ', newName)
    try {
      const response = await axios.put(
        renameUrl,
        form,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          params: { "access_token": User.$state.orcidAccessToken }
        }
      )

      console.log(response)

      if (response.status === 200) {
        return true
      }
      return false
    }
    catch(e: any) {
      console.log(e)
      return false
    }
  }

  static async deleteFileOrFolder(identifier: string, item: IFile | IFolder): Promise<boolean> {
    const url = this.get()?.urls?.fileDeleteUrl
    const deleteUrl = sprintf(url, identifier, item.key)

    try {
      const response = await axios.delete(deleteUrl, {
        params: { "access_token": User.$state.orcidAccessToken }
      })

      if (response.status === 200 || response.status === 204) {
        return true
      }
      return false
    }
    catch(e: any) {
      console.log(e)
      CzNotification.toast({ message: 'Failed to delete file' })
    }

    return false
  }
}