
import { EnumRepositoryKeys } from '@/components/submissions/types'
import { IFile, IFolder } from '@/components/new-submission/types'
import axios from "axios"
import Repository from './repository.model'

export default class Zenodo extends Repository {
  static entity = EnumRepositoryKeys.zenodo
  static baseEntity = 'repository'

  static state() {
    return {
      ...super.state(),
    }
  }

  static async uploadFiles(bucketUrl: string, itemsToUpload: (IFile | IFolder)[] | any[], createFolderUrl: string) {
    const promises = itemsToUpload.map((file) => {
      // const url = `${bucketUrl}/${file.name}` // new api
      const url = bucketUrl // new api
      const form = new window.FormData()
      form.append('file', file.file, file.name)

      return axios.post(
        url,
        form,
        { 
          headers: { 'Content-Type': 'multipart/form-data' }, 
          params: { "access_token": this.accessToken }
        }
      )
    })

    const resp: PromiseSettledResult<any>[] = await Promise.allSettled(promises)
    // TODO: indicate to Cz api that files were uploaded
  }

  static async readFolder(identifier: string, path: string, rootDirectory: IFolder): Promise<(IFile | IFolder)[]> {
    return  []
  }
}
