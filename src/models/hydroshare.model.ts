
import { EnumRepositoryKeys } from '@/components/submissions/types'
import { IFolder, IFile } from '@/components/new-submission/types'
import axios from "axios"
import Repository from './repository.model'

const sprintf = require("sprintf-js").sprintf

export default class HydroShare extends Repository {
  static entity = EnumRepositoryKeys.hydroshare
  static baseEntity = 'repository'

  static state() {
    return {
      ...super.state(),
    }
  }

  static async uploadFiles(bucketUrl: string, itemsToUpload: (IFile | IFolder)[] | any[], createFolderUrl: string) {
    const filesToUpload = itemsToUpload.filter(i => i.hasOwnProperty('file'))
    const foldersToUpload = itemsToUpload.filter(i => i.hasOwnProperty('children'))

    let folderPaths = foldersToUpload.map(f => `${f.path ? f.path + '/' : ''}${f.name}`)
    // Get unique paths
    folderPaths = [...new Set(folderPaths)].sort((a, b) => b.split('/').length - a.split('/').length)

    // HydroShare can only create multiple folders at a time if the parent folder already exists
    // So we traverse the tree by depth and create folders in each depth at a time
    const that = this
    
    if (folderPaths.length) {
      // Create folders
      await _createFoldersByDepth(folderPaths, 1)
    }
    else {
      // No folders to create. Just upload files directly.
      await _uploadFiles()
    }

    async function _createFoldersByDepth(paths: string[], depth: number) {
      const depthPaths = paths.filter(p => p.split('/').length === depth)

      const folderCreatePromises = depthPaths.map((path: string) => {
        const folderCreateUrl = sprintf(
          createFolderUrl,
          encodeURIComponent(path)
        )
  
        return axios.put(
          folderCreateUrl,
          {},
          { 
            // headers: { 'Content-Type': 'multipart/form-data', }, 
            params: { "access_token": that.accessToken }
          }
        )
      })
      await Promise.allSettled(folderCreatePromises)
      const remaining = paths.filter(p => p.split('/').length > depth)
      if (remaining.length) {
        _createFoldersByDepth(remaining, depth + 1)
      }
      else {
        // Finished creating folders. Files can be added.
        _uploadFiles()
      }
    }

    async function _uploadFiles() {
      const fileUploadPromises = filesToUpload.map((file: IFile) => {
        let url = bucketUrl
        const form = new window.FormData()
        form.append('file', file.file, file.name)
  
        // Check if the file is in a folder
        if (file.path) {
          url = `${url}${ encodeURIComponent(file.path) }/`
        }
  
        return axios.post(
          url,
          form,
          { 
            headers: { 
              'Content-Type': 'multipart/form-data', 
            }, 
            params: { "access_token": that.accessToken }
          }
        )
      })
      const response: PromiseSettledResult<any>[] = await Promise.allSettled(fileUploadPromises)
    }
  }
}
