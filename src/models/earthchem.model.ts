
import { EnumRepositoryKeys } from '@/components/submissions/types'
import { IFile, IFolder } from '@/components/new-submission/types'
import axios from "axios"
import Repository from './repository.model'
import CzNotification from './notifications.model'

const sprintf = require("sprintf-js").sprintf

export default class EarthChem extends Repository {
  static entity = EnumRepositoryKeys.earthchem
  static baseEntity = 'repository'

  static state() {
    return {
      ...super.state(),
    }
  }

  /** Uploads multiple files sequentially */
  static async uploadFiles(bucketUrl: string, itemsToUpload: (IFile | IFolder)[] | any[], createFolderUrl: string) {
    // EarthChem needs files uploaded sequentially
    const response: any[] = []

    for (const item of itemsToUpload) {
      const message = await this._uploadFile(item, bucketUrl)
      response.push(message)
    }

    itemsToUpload.map((f, index) => {
      if (!response[index]) {
        // Uplaod failed for this file
        f.parent.children = f.parent.children.filter(file => file.name !== f.name)
      }
    })

    // TODO: figure out how to identify that fail was due to a name that already exists
    if (response.some(r => !r)) {
      CzNotification.toast({
        message: 'Some of your files failed to upload',
        type: 'error'
      })
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
      { 
        headers: { 
          'Authorization': `Bearer ${this.accessToken}`,
        }
      }
    )

    if (response.status === 200) {
      const files: IFile[] = response.data.map((file: any, index): IFile => {
        return {
          name: file.name,
          serverName: file.serverName,
          parent: rootDirectory,
          isRenaming: false,
          isCutting: false,
          isDisabled: false,
          isUploaded: true,
          key: `${Date.now().toString()}-${index}`,
          path: path,
          file: null,
          uploadedSize: file.size
        }
      })

      return files
    }

    return []
  }

  static async deleteFileOrFolder(identifier: string, item: IFile | IFolder): Promise<boolean> {
    const url = this.get()?.urls?.fileDeleteUrl
    const deleteUrl = sprintf(url, identifier, (item as IFile).serverName)

    try {
      const response = await axios.delete(deleteUrl, { 
        headers: { 
          'Authorization': `Bearer ${this.accessToken}`,
        }
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

  /** Uploads a single file */
  private static async _uploadFile(file, url: string) {
    const form = new window.FormData()
    form.append('file', file.file, file.name)
    form.append('description', file.name)

    file.isDisabled = true
    const response = await axios.post(
      url,
      form,
      { 
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${this.accessToken}`,
        }
      }
    )
    file.isDisabled = false
    file.isUploaded = response.status === 200
    // TODO: EarthChem api currently does not return this id
    // file.key = response.data.id
    // file.serverName = response.data.serverName
    // file.name = response.data.name

    return response.status === 200
  }

  /** @deprecated currently not supported by EarthChem */
  // static async renameFileOrFolder(identifier: string, item: IFile | IFolder, newPath: string): Promise<boolean> {
  //   const url = this.get()?.urls?.moveOrRenameUrl
  //   const renameUrl = sprintf(url, identifier, item.key)
  //   const form = new window.FormData()

  //   const newName = newPath.split('/').pop()
  //   if (!newName) {
  //     return false
  //   }
  //   form.append('filename ', newName)
  //   try {
  //     const response = await axios.put(
  //       renameUrl,
  //       form,
  //       { 
  //         headers: { 
  //           'Content-Type': 'multipart/form-data',
  //           'Authorization': `Bearer ${this.accessToken}`,
  //         }
  //       }
  //     )
  
  //     if (response.status === 200) {
  //       return true
  //     }
  //     return false
  //   }
  //   catch(e: any) {
  //     console.log(e)
  //     return false
  //   }
  // }
}
