
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
        if (file.file) {
          form.append('file', file.file, file.name)
        }
  
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

  static async readFolder(identifier: string, path: string, rootDirectory: IFolder): Promise<(IFile | IFolder)[]> {
    return this._readFolderRecursive(identifier, path, rootDirectory)
  }

  private static async _readFolderRecursive(identifier: string, path: string, folder: IFolder): Promise<(IFile | IFolder)[]> {
    const url = this.get()?.urls?.folderCreateUrl
    const folderReadUrl = sprintf(
      url,
      identifier,
      encodeURIComponent(path || ' ') // HydroShare accepts ' ' to indicate root directory
    )
    
    const response = await axios.get(
      folderReadUrl,
      { params: { "access_token": this.accessToken } }
    )
    if (response.status === 200) {
      const files: IFile[] = response.data.files.map((fileName: string, index: number): IFile => {
        return {
          name: fileName,
          parent: folder,
          isRenaming: false,
          isCutting: false,
          key: `${Date.now().toString()}-a-${index}`,
          path: path,
          file: null,
        }
      })

      const folders: IFolder[] = response.data.folders.map((folderName: string, index: number): IFolder => {
        return {
          name: folderName,
          parent: folder,
          isRenaming: false,
          isCutting: false,
          key: `${Date.now().toString()}-b-${index}`,
          path: path,
          children: [],
        }
      })

      if (folders.length) {
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

    return []
  }
}
