
import { EnumRepositoryKeys } from '@/components/submissions/types'
import { IFile, IFolder } from '@/components/new-submission/types'
import axios from "axios"
import Repository from './repository.model'
import { fi } from 'date-fns/locale'
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
      return _uploadFile(file, this.accessToken)
    })

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

    const response = await Promise.allSettled(uploadPromises)

    itemsToUpload.map((f, index) => {
      if (response[index].status !== 'fulfilled') {
        // Uplaod failed for this file
        f.parent.children = f.parent.children.filter(file => file.name !== f.name)
      }
    })
    console.log(response)

    // TODO: figure out how to identify that fail was due to a name that already exists
    if (response.some(r => r.status === 'rejected')) {
      CzNotification.toast({ message: 'Some of your files failed to upload'})
    }
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
        params: { "access_token": this.accessToken }
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
