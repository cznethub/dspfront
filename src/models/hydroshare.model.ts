
import { EnumRepositoryKeys, ISubmission } from '@/components/submissions/types'
import { router } from '@/router';
import axios, { AxiosRequestConfig } from "axios"
import Repository from './repository.model'
import Submission from './submission.model';

const sprintf = require('sprintf-js').sprintf

export default class HydroShare extends Repository {
  static entity = EnumRepositoryKeys.hydroshare
  static baseEntity = 'repository'

  static state() {
    return {
      ...super.state(),
    }
  }

  static async createSubmission(data?: any): Promise<{ recordId: string, czHubRecordId: number, formMetadata: any } | null> {
    console.info("HydroShare: Creating submission...")
    
    const hydroShare = this.get()
    
    if (hydroShare) {
      try {
        const depositionMetadata = data || {}

        const resp = await axios.post(
          hydroShare.urls?.createUrl || '',
          {},
          { 
            headers: { "Content-Type": "application/json"},
            params: { "access_token": this.accessToken }
          }
        )

        if (resp.status === 201) {
          // resp.links
          const recordId = resp.data.resource_id
          await this.updateRepositoryRecord(recordId, depositionMetadata)
          const formMetadata = await this.read(recordId)

          const data = Submission.getRepoApiInsertData(formMetadata, this.entity)
          const inserted = await Submission.insert({ data })
          console.log(inserted)
          
          return { recordId, formMetadata, czHubRecordId: 0 }
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
  
  static async deleteRecord(recordId: string) {
    const hydroShare = this.get()

    if (hydroShare) {
      const url = sprintf(hydroShare.urls?.deleteUrl, recordId)

      await axios.delete(
        url,
        { 
          headers: { "Content-Type": "application/json"},
          params: { "access_token": this.accessToken },
        } as AxiosRequestConfig
      )

      // Delete on CZHub
      await axios.delete(`/api/draft/${this.entity}/${recordId}`)
    }
  }

  /** Reads a record from the repository */
  static async read(recordId: string) {
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
    }
  }

  /** Updates the record in the repository. After that the record is updated in CzHub as well. */
  static async updateRepositoryRecord(recordId: string, metadata: any) {
    const hydroShare = this.get()
    if (hydroShare) {
      const url = sprintf(hydroShare.urls?.updateUrl, recordId)

      await axios.put(
        url,
        metadata,
        { 
          headers: { "Content-Type": "application/json"},
          params: { "access_token": this.accessToken },
        } as AxiosRequestConfig
      )

      // Save to CZHub
      await this.updateCzHubRecord(recordId)
    }
  }
}
