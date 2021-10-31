
import { EnumRepositoryKeys } from '@/components/submissions/types'
import { router } from '@/router';
import axios from "axios"
import Repository from './repository.model'

const sprintf = require('sprintf-js').sprintf

export default class HydroShare extends Repository {
  static entity = EnumRepositoryKeys.hydroShare
  static baseEntity = 'repository'

  static state() {
    return {
      ...super.state(),
    }
  }

  static async updateMetadata(data: { [key: string]: any }, recordId?: string) {
    const hydroShare = this.get()
    if (hydroShare) {
      const url = sprintf(hydroShare.urls?.readUrl, recordId)
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
    console.info("HydroShare: Creating submission...")
    const hydroShare = this.get()
    
    if (hydroShare) {
      try {
        const depositionMetadata = data
          ? { metadata: data }
          : { }
        const resp = await axios.post(
          hydroShare.urls?.createUrl || '',
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
          console.info("HydroShare: Failed to create submission. Unknown response status.", resp)
        }
      }
      catch(e: any) {
        if (e.response.status === 401) {
          // Token has expired
          this.commit((state) => {
            state.accessToken = ''
          })
          router.push({ path: '/authorize', query: { repo: this.entity, next: `/submit/${this.entity}` } })
          
          console.info("HydroShare: Authorization token is invalid or has expired.")
          console.info("HydroShare: Redirecting to authorization page...")
        }
        else {
          console.error("HydroShare: failed to create submission. ", e.response)
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
    const hydroShare = this.get()
    if (hydroShare) {
      const url = sprintf(hydroShare.urls?.readUrl, recordId)
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
