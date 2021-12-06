
import { EnumRepositoryKeys } from '@/components/submissions/types'
import { router } from '@/router';
import axios, { AxiosRequestConfig } from "axios"
import CzNotification from './notifications.model';
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

  static async createSubmission(data?: any): Promise<{ recordId: string, formMetadata: any } | null> {
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
          await this.updateRepositoryRecord(recordId, data || {})
          const formMetadata = await this.read(recordId)
          return { recordId, formMetadata }
        }
        else {
          // Unexpected response
          console.info("Zenodo: Failed to create submission. Unknown response status.", resp)
        }
      }
      catch(e: any) {
        if (e.response.status === 401) {
          // Token has expired or is invalid
          this.commit((state) => {
            state.accessToken = ''
          })
          
          CzNotification.toast({
            message: 'Authorization token is invalid or has expired.'
          })
          router.push({ path: '/authorize', query: { repo: this.entity, next: `/submit/${this.entity}` } })
          
          console.info("Zenodo: Authorization token is invalid or has expired.")
          console.info("Zenodo: Redirecting to authorization page...")
        }
        else {
          console.error("Zenodo: failed to create submission. ", e.response)
        }
        throw(e)
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
      const response = await axios.delete(`/api/submit/${this.entity}/${recordId}`)
      if (response.status === 200) {
        await this.deleteSubmission(recordId)
        // await Submission.delete([recordId, this.entity])
        // CzNotification.toast({ message: 'Your submission has been deleted' })
        // router.push({ path: '/submissions' })
      }
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
    const zenodo = this.get()
    if (zenodo) {
      const url = sprintf(zenodo.urls?.updateUrl, recordId)

      await axios.put(
        url,
        metadata,
        { 
          headers: { "Content-Type": "application/json"},
          params: { "access_token": this.accessToken },
        } as AxiosRequestConfig
      )

      // Save to CZHub
      await this.updateCzHubRecord(recordId, this.entity)
    }
  }
}
