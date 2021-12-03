
import { EnumRepositoryKeys } from '@/components/submissions/types'
import { router } from '@/router';
import axios, { AxiosRequestConfig } from "axios"
import Repository from './repository.model'
import Submission from './submission.model';

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
          const czHubRecord = await axios.get(`/api/draft/${this.entity}/${recordId}`)
          console.log(czHubRecord)

          Submission.insertOrUpdate({ data: Submission.getRepoApiInsertData(formMetadata, this.entity)})

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
          router.push({ path: '/authorize', query: { repo: this.entity, next: `/submit/${this.entity}` } })
          
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

  static async deleteRecord(recordId: string) {
    const zenodo = this.get()
    
    if (zenodo) {
      const url = sprintf(zenodo.urls?.deleteUrl, recordId)

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

  static async read(recordId: string) {
    const zenodo = this.get()
    
    if (zenodo) {
      const url = sprintf(zenodo.urls?.readUrl, recordId)
      const resp = await axios.get(url, { params: { "access_token": this.accessToken } })
      if (resp.status === 200) {
        return resp.data
      }
      else {
        return { }
      }
    }
  }

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
