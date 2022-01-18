
import { EnumRepositoryKeys } from '@/components/submissions/types'
import { router } from '@/router';
import axios, { AxiosRequestConfig } from "axios"
import CzNotification from './notifications.model';
import Repository from './repository.model'

const sprintf = require('sprintf-js').sprintf

export default class HydroShare extends Repository {
  static entity = EnumRepositoryKeys.hydroshare
  static baseEntity = 'repository'

  static state() {
    return {
      ...super.state(),
    }
  }

  static async createSubmission(data?: any): Promise<{ recordId: string, formMetadata: any } | null> {
    console.info("HydroShare: Creating submission...")
    
    const hydroShare = this.get()
    
    if (hydroShare) {
      try {
        // Create an empty resource
        const response = await axios.post(
          hydroShare.urls?.createUrl || '',
          {},
          { 
            headers: { "Content-Type": "application/json"},
            params: { "access_token": this.accessToken }
          }
        )

        if (response.status === 201) {
          // Update the resource with the deposition data
          const recordId = response.data.resource_id
          await this.updateRepositoryRecord(recordId, data || {})
          const formMetadata = await this.read(recordId)
          return { recordId, formMetadata }
        }
        else {
          // Unexpected response
          console.info("HydroShare: Failed to create submission. Unknown response status.", response)
        }
      }
      catch(e: any) {
        if (e.response.status === 401) {
          // Token has expired
          this.commit((state) => {
            state.accessToken = ''
          })
          CzNotification.toast({
            message: 'Authorization token is invalid or has expired.'
          })
          router.push({ path: '/authorize', query: { repo: this.entity, next: `/submit/${this.entity}` } })
          
          console.info("HydroShare: Authorization token is invalid or has expired.")
          console.info("HydroShare: Redirecting to authorization page...")
        }
        else {
          console.error("HydroShare: failed to create submission. ", e.response)
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
  
  static async deleteRecord(identifier: string, repository: string) {
    const hydroShare = this.get()

    if (hydroShare) {
      // TODO: add hydroshare endpoint to delete resource
      // const url = sprintf(hydroShare.urls?.deleteUrl, recordId)

      // await axios.delete(
      //   url,
      //   { 
      //     headers: { "Content-Type": "application/json"},
      //     params: { "access_token": this.accessToken },
      //   } as AxiosRequestConfig
      // )

      // Delete on CZHub
      const response = await axios.delete(`/api/submit/${this.entity}/${identifier}`)
      if (response.status === 200) {
        await this.deleteSubmission(identifier, repository)
        // await Submission.delete([recordId, this.entity])
        // CzNotification.toast({ message: 'Your submission has been deleted' })
        // router.push({ path: '/submissions' })
      }
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
      await this.updateCzHubRecord(recordId, this.entity)
    }
  }
}
