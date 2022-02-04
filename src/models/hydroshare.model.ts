
import { EnumRepositoryKeys } from '@/components/submissions/types'
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

  static async uploadFiles(bucketUrl: string, filesToUpload: any[] | any[], identifier?: string) {
    let folderPromises: any[] = []
    const promises = filesToUpload.map((file) => {
      // const url = `${bucketUrl}/${file.name}` // new api
      const url = bucketUrl // new api
      const form = new window.FormData()
      form.append('file', file.file, file.name)
      // TODO: check if the file is nested
      if (true) {
        form.append('file_folder', 'test_folder')

        // Folder needs to be created
        const folderCreationform = new window.FormData()
        folderCreationform.append('res_id', identifier || '')
        folderCreationform.append('folder_path', 'test_folder')
        const folderCreationPromise = axios.post(
          `https://beta.hydroshare.org/hsapi/_internal/data-store-create-folder/`,
          folderCreationform,
          { 
            headers: { 'Content-Type': 'multipart/form-data', 
            'X-CSRF-TOKEN': this.accessToken // TODO: this token won't work in this endpoint. It asks for a csrftoken
          }, 
            // params: { "access_token": this.accessToken }
          }
        )

        folderPromises.push(folderCreationPromise)
      }

      return axios.post(
        url,
        form,
        { 
          headers: { 
            'Content-Type': 'multipart/form-data', 
            'X-CSRF-TOKEN': this.accessToken 
          }, 
          // params: { "access_token": this.accessToken }
        }
      )
    })

    const folderCreations = await Promise.allSettled(folderPromises)
    const resp: PromiseSettledResult<any>[] = await Promise.allSettled(promises)
    // TODO: indicate to Cz api that files were uploaded
  }
}
