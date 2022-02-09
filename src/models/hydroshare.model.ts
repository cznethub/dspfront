
import { EnumRepositoryKeys } from '@/components/submissions/types'
import { IFolder, IFile } from '@/components/new-submission/types'
import axios, { AxiosResponse } from "axios"
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

  static async uploadFiles(bucketUrl: string, filesToUpload: IFile[] | any[], createFolderUrl: string) {
    let folderPaths = filesToUpload.map(f => f.path)
    // Get unique paths
    folderPaths = [...new Set(folderPaths)].sort((a, b) => (a < b ? 1 : -1))
    folderPaths = folderPaths
      .filter(path => path && !folderPaths.some((p) => {
        return (p.length > path.length) && p.startsWith(`${path}/`)
      }))

    const folderPromises = folderPaths.map((path: string) => {
      const folderCreateUrl = sprintf(
        createFolderUrl,
        encodeURIComponent(path)
      )
      return axios.put(
        folderCreateUrl,
        {},
        { 
          // headers: { 'Content-Type': 'multipart/form-data', }, 
          params: { "access_token": this.accessToken }
        }
      )
    })

    const promises = filesToUpload.map((file: IFile) => {
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
          params: { "access_token": this.accessToken }
        }
      )
    })

    const folderCreations: PromiseSettledResult<any>[] = await Promise.allSettled(folderPromises)
    const resp: PromiseSettledResult<any>[] = await Promise.allSettled(promises)
    // TODO: indicate to Cz api that files were uploaded
  }
}
