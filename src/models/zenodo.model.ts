
import { EnumRepositoryKeys, IRepository, IRepositoryUrls } from '@/components/submissions/types'
import { repoMetadata } from '@/components/submit/constants'
import { router } from '@/router';
import axios from "axios"
import Repository from './repository.model'

const sprintf = require('sprintf-js').sprintf

export default class Zenodo extends Repository implements IRepository {
  static entity = EnumRepositoryKeys.zenodo

  static get isAuthorized() {
    return !!(this.$state.accessToken)
  }

  static get accessToken() {
    return this.$state.accessToken
  }

  static state() {
    return {
      ...super.state(),
      accessToken: ''
    }
  }

  static fields () {
    return {
      ...super.fields()
    }
  }
  
  static async init() {
    // Insert initial repo
    if (!(this.get())) {
      console.info("Zenodo: Initializing zenodo for the first time...")
      const newZenodoRepo: IRepository = {
        ...repoMetadata[4],
      }

      this.insert({ data : newZenodoRepo })
    }

    // Fetch urls and schema if not populated yet
    const zenodo = this.get()
    if (!(zenodo?.urls && Object.keys(zenodo.urls).length)) {
      const urls: IRepositoryUrls | undefined = await Zenodo.getUrls()
      // Do we want to load the schema every time to keep it updated?
      const schema: any = await Zenodo.getSchema(urls?.schemaUrl)

      Zenodo.update({
        where: Zenodo.entity,
        data: { urls, schema }
      })
    }

    // If we don't have an access token stored, fetch one using the accessTokenUrl
    // TODO: also check if it expired, and if so refresh it
    if (!(Zenodo.isAuthorized) && this.get()?.urls?.accessTokenUrl) {
      await Zenodo.fetchAccessToken()
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
          params: { access_token: Zenodo.accessToken }, 
        },
      )
    }
  }

  protected static async getSchema(schemaUrl: string | undefined) {
    if (!schemaUrl) {
      return undefined
    }

    const resp = await axios.get(schemaUrl)

    if (resp.status === 200) {
      return resp.data
    }
  }

  protected static async getUrls(): Promise<undefined | IRepositoryUrls> {
    try {
      const resp = await axios.get("/api/urls/" + this.get()?.key)

      return {
        schemaUrl: resp.data.schema,
        createUrl: resp.data.create,
        updateUrl: resp.data.update,
        readUrl: resp.data.read,
        fileCreateUrl: resp.data.file_create,
        fileDeleteUrl: resp.data.file_delete,
        fileReadUrl: resp.data.file_read,
        accessTokenUrl: resp.data.access_token,
        authorizeUrl: resp.data.authorize_url,
      }
    }
    catch(e) {
      console.error('Zenodo: Failed to fetch repository Urls', e)
      return undefined
    }
  }

  private static async fetchAccessToken() {
    console.info("Zenodo: Fetching access token...")
    const accessTokenUrl = Zenodo.get()?.urls?.accessTokenUrl
    if (accessTokenUrl) {
      try {
        const resp = await axios.get(accessTokenUrl)
        if (resp.status === 200) {
          const token = resp.data.token // TODO: also need its expiration date!
          Zenodo.commit((state) => {
            state.accessToken = token
          })
        }
      }
      catch(e) {
        Zenodo.commit((state) => {
          state.accessToken = ''
        })
        console.error('Zenodo: failed to fetch access token. ', e)
      }
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
            params: { "access_token": Zenodo.accessToken } 
          }
        )

        if (resp.status === 201) {
          // resp.links
          const recordId = resp.data.record_id
          const formMetadata = await this.read(recordId)
          return { recordId, formMetadata }

          // Save to CZHub

        }
        else {
          // Unexpected response
          console.info("Zenodo: Failed to create submission. Unknown response status.", resp)
        }
      }
      catch(e: any) {
        if (e.response.status === 401) {
          // Token has expired
          Zenodo.commit((state) => {
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
    // const promises = filesToUpload.map((file) => {
    //   const url = `${bucketUrl}/${file.name}`
    //   return axios.put(
    //     url, 
    //     file.data,
    //     { 
    //       params: { access_token: Zenodo.accessToken }, 
    //     },
    //   )
    // })

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
          params: { "access_token": Zenodo.accessToken }
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
      const resp = await axios.get(url, { params: { "access_token": Zenodo.accessToken } })
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