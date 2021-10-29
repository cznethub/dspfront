
import { EnumRepositoryKeys } from '@/components/submissions/types'
import { router } from '@/router';
import axios from "axios"
import Repository from './repository.model'

const sprintf = require('sprintf-js').sprintf

export default class Zenodo extends Repository {
  static entity = EnumRepositoryKeys.zenodo
  static baseEntity = 'repository'

  static state() {
    return {
      ...super.state(),
    }
  }


  static async updateMetadata(data: { [key: string]: any }, recordId?: string) {
    const zenodo = this.get()
    if (zenodo) {
      const url = sprintf(zenodo.urls?.readUrl, recordId)
      const resp = await axios.put(
        url, 
        JSON.stringify(data),
        { 
          headers: {"Content-Type": "application/json"}, 
          params: { access_token: this.accessToken }, 
        },
      )
    }
  }

  static async createSubmission(data?: any): Promise<{ recordId: string, formMetadata: any} | null> {
    console.info("Zenodo: Creating submission...")
    const zenodo = this.get()
    
    if (zenodo) {
      try {
        const depositionMetadata = data
          ? { metadata: data }
          : { }
        const resp = await axios.post(
          zenodo.urls?.createUrl || '',
          depositionMetadata,
          { 
            headers: { "Content-Type": "application/json"},
            params: { "access_token": this.accessToken } 
          }
        )

        if (resp.status === 201) {
          // resp.links
          const recordId = resp.data.record_id
          const formMetadata = await this.read(recordId)

          // Save to CZHub
          const czResp = await axios.get(`/api/draft/${this.entity}/${recordId}`)
          // console.log(czResp)

          // TODO: insert into Submission model
          return { recordId, formMetadata }
        }
        else {
          // Unexpected response
          console.info("Zenodo: Failed to create submission. Unknown response status.", resp)
        }
      }
      catch(e: any) {
        if (e.response.status === 401) {
          // Token has expired
          this.commit((state) => {
            state.accessToken = ''
          })
          router.push({ path: '/authorize', query: { repo: this.entity, next: '/new-submission' } })
          
          console.info("Zenodo: Authorization token is invalid or has expired.")
          console.info("Zenodo: Redirecting to authorization page...")
        }
        else {
          console.error("Zenodo: failed to create submission. ", e.response)
        }
      }
    }
    return null
  }

  static async uploadFiles(bucketUrl: string, filesToUpload: { name: string, data: any }[] | any[]) {
    const promises = filesToUpload.map((file) => {
      // const url = `${bucketUrl}/${file.name}` // new api
      const url = bucketUrl // new api
      const form = new window.FormData()
      form.append('file', file, file.name)

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

  private static async read(recordId: string) {
    const zenodo = this.get()
    if (zenodo) {
      const url = sprintf(zenodo.urls?.readUrl, recordId)
      const resp = await axios.get(url, { params: { "access_token": this.accessToken } })
      if (resp.status === 200) {
        return resp.data
      }
      else {
        return {}
      }
      // .then((resp) => {
      //   this.data = this.metadataKey ? resp.data["metadata"] : resp.data;
      //   this.edit = true;
      //   this.loadFiles = true
      // })
      // .catch((error) => {
      //   this.data = {}
      //   this.edit = false;
      //   this.message = error.message;
      // });
    }
  }
}
