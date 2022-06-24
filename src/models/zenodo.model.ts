
import { EnumRepositoryKeys } from '@/components/submissions/types'
import { IFile, IFolder } from '@/components/new-submission/types'
import axios from "axios"
import Repository from './repository.model'
import CzNotification from './notifications.model'

const sprintf = require("sprintf-js").sprintf

export default class Zenodo extends Repository {
  static entity = EnumRepositoryKeys.zenodo
  static baseEntity = 'repository'

  static state() {
    return {
      ...super.state(),
    }
  }

  static async uploadFiles(bucketUrl: string, itemsToUpload: (IFile | IFolder)[] | any[], createFolderUrl: string) {
    const uploadPromises: Promise<boolean>[] = itemsToUpload.map((file) => {
      return this._uploadFile(file, bucketUrl)
    })

    const response = await Promise.allSettled(uploadPromises)

    itemsToUpload.map((f, index) => {
      if (response[index].status !== 'fulfilled') {
        // Uplaod failed for this file
        f.parent.children = f.parent.children.filter(file => file.name !== f.name)
      }
    })

    // TODO: figure out how to identify that fail was due to a name that already exists
    if (response.some(r => r.status === 'rejected')) {
      CzNotification.toast({ 
        message: 'Some of your files failed to upload',
        type: 'error'
      })
    }
  }

  private static async _uploadFile(file: IFile, url: string) {
    const form = new window.FormData();

    // Make sure the file itself has our resolved name
    // Object.defineProperty(file.file, 'name', {
    //   writable: true,
    //   value: file.name
    // })

    form.append('file', file.file as File, file.name)

    file.isDisabled = true
    const response = await axios.post(
      url,
      form,
      { 
        headers: { 'Content-Type': 'multipart/form-data' }, 
        params: { "access_token": this.accessToken }
      }
    )
    file.isDisabled = false
    file.key = response.data.id
    file.isUploaded = response.status === 200
    
    return response.status === 200
  }

  static async readRootFolder(identifier: string, path: string, rootDirectory: IFolder): Promise<(IFile | IFolder)[]> {
    const url = this.get()?.urls?.fileReadUrl
    const folderReadUrl = sprintf(
      url,
      identifier,
      // encodeURIComponent(path || '')
    )
    
    const response = await axios.get(
      folderReadUrl,
      { params: { "access_token": this.accessToken } }
    )
    if (response.status === 200) {
      const files: IFile[] = response.data.map((file: any): IFile => {
        return {
          name: file.filename,
          parent: rootDirectory,
          isRenaming: false,
          isCutting: false,
          isDisabled: false,
          isUploaded: true,
          key: file.id, // We use the file id in this case, so we can use it again as reference to edit files
          path: path,
          file: null,
        }
      })

      return files
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
          params: { "access_token": this.accessToken }
        }
      )
  
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
        params: { "access_token": this.accessToken }
      })
  
      return response.status === 200 || response.status === 204
    }
    catch(e: any) {
      console.log(e)
      CzNotification.toast({
        message: 'Failed to delete file',
        type: 'error'
      })
    }

    return false
  }
}
