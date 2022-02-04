
import { EnumRepositoryKeys } from '@/components/submissions/types'
import { IFolder, IFile } from '@/components/new-submission/types'
import axios, { AxiosResponse } from "axios"
import Repository from './repository.model'

export default class HydroShare extends Repository {
  static entity = EnumRepositoryKeys.hydroshare
  static baseEntity = 'repository'

  static state() {
    return {
      ...super.state(),
    }
  }

  static async uploadFiles(bucketUrl: string, filesToUpload: IFile[] | any[], identifier?: string) {
    const folderPromises = filesToUpload.map((file: IFile) => {
      // TODO: integrate folder creation endpoints
      // if (file.path) {
      //   // Folder needs to be created
      //   const folderCreationform = new window.FormData()
      //   folderCreationform.append('res_id', identifier || '')
      //   folderCreationform.append('folder_path', 'test_folder')
      //   return axios.post(
      //     `https://beta.hydroshare.org/hsapi/_internal/data-store-create-folder/`,
      //     folderCreationform,
      //     { 
      //       headers: { 'Content-Type': 'multipart/form-data', }, 
      //       params: { "access_token": this.accessToken }
      //     }
      //   )
      // }
    })

    const promises = filesToUpload.map((file: IFile) => {
      const url = bucketUrl
      const form = new window.FormData()
      form.append('file', file.file, file.name)
      // Check if the file is in a folder
      // if (file.path) {
      //   form.append('file_folder', 'folder/path')
      // }

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

    // const folderCreations: PromiseSettledResult<any>[] = await Promise.allSettled(folderPromises)
    const resp: PromiseSettledResult<any>[] = await Promise.allSettled(promises)
    // TODO: indicate to Cz api that files were uploaded
  }
}
