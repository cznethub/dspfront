import { Model } from '@vuex-orm/core'
import { EnumRepositoryKeys, IRepository, IRepositoryUrls } from '@/components/submissions/types'
import { repoMetadata } from "@/components/submit/constants";
import { router } from '@/router';
import axios from "axios";
import Submission from './submission.model';
import CzNotification from './notifications.model';
import User from './user.model';

export default class Repository extends Model implements IRepository {
  static entity = 'repository'
  static primaryKey = 'key'
  public readonly key!: EnumRepositoryKeys
  public readonly name!: string
  public readonly logoSrc!: string
  public readonly description!: string
  public readonly submitLabel?: string
  public readonly urls?: IRepositoryUrls
  public readonly schema?: any
  public readonly uischema?: any
  public readonly schemaDefaults?: any

  static get isAuthorized() {
    return !!(this.$state.accessToken)
  }

  static get accessToken() {
    return this.$state.accessToken
  }

  static state() {
    return {
      accessToken: '',
      submittingTo: null
    }
  }

  static get $state() {
    return this.store().state.entities[this.entity]
  }

  // static get activeRepository() {
  //   return Repository.query().where('key', this.$state.submittingTo).withAll().first()
  // }

  static fields () {
    return {
      key:  this.attr(''),
      name:  this.attr(''),
      logoSrc:  this.attr(''),
      description:  this.attr(''),
      submitLabel:  this.attr(''),
      urls: this.attr({}),
      schema: this.attr({}),
      uischema: this.attr({}),
      schemaDefaults: this.attr({}),
    }
  }

  // TODO: this causes a circular dependency error
  // https://vuex-orm.org/guide/model/single-table-inheritance.html#notes-on-circular-imports
  // static types() {
  //   return {
  //     [Zenodo.entity]: Zenodo,
  //     [HydroShare.entity]: HydroShare,
  //   }
  // }

  static async init() {
    // Insert initial repo
    if (!(this.get())) {
      console.info(`Repository: Initializing ${this.entity} for the first time...`)
      const newRepo: IRepository = {
        ...repoMetadata[this.entity],
      }

      Repository.insertOrUpdate({ data : newRepo })
    }

    // Fetch urls and schemas
    // const repository = this.get()
    console.info(`${this.entity}: fetching schemas...`)
    const urls: IRepositoryUrls | undefined = await this.getUrls()

    let results: PromiseSettledResult<any>[] = await Promise.allSettled([
      this.getJson(urls?.schemaUrl),
      this.getJson(urls?.uischemaUrl),
      this.getJson(urls?.schemaDefaultsUrl)
    ])

    results = results.map((r: PromiseSettledResult<any>) => {
      if (r.status === 'fulfilled') {
        return r.value
      }
    })

    const schema = results[0]
    const uischema = results[1]
    const schemaDefaults = results[2]

    this.update({
      where: this.entity,
      data: { urls, schema, uischema, schemaDefaults }
    })

    // If we don't have an access token stored, fetch one using the accessTokenUrl
    // TODO: also check if it expired, and if so refresh it
    // if (!(this.isAuthorized) && repository?.urls?.accessTokenUrl) {
      await this.fetchAccessToken()
    // }
  }

  protected static async getJson(jsonUrl: string | undefined) {
    if (!jsonUrl) {
      return undefined
    }

    const resp = await axios.get(jsonUrl, { 
      params: { "access_token": User.$state.orcidAccessToken }
    })

    if (resp.status === 200) {
      return resp.data
    }
  }

  protected static async getUrls(): Promise<undefined | IRepositoryUrls> {
    try {
      const resp = await axios.get("/api/urls/" + this.get()?.key, { 
        params: { "access_token": User.$state.orcidAccessToken }
      })

      return {
        schemaUrl: resp.data.schema,
        uischemaUrl: resp.data.uischema,
        schemaDefaultsUrl: resp.data.schema_defaults,
        createUrl: resp.data.create,
        updateUrl: resp.data.update,
        readUrl: resp.data.read,
        deleteUrl: '',
        fileCreateUrl: resp.data.file_create,
        fileDeleteUrl: resp.data.file_delete,
        fileReadUrl: resp.data.file_read,
        accessTokenUrl: resp.data.access_token,
        authorizeUrl: resp.data.authorize_url,
        viewUrl: resp.data.view_url
      }
    }
    catch(e) {
      console.error(this.get()?.key + ': Failed to fetch repository Urls', e)
      return undefined
    }
  }

  private static async fetchAccessToken() {
    console.info(this.get()?.key + ": Fetching access token...")
    const accessTokenUrl = this.get()?.urls?.accessTokenUrl
    if (accessTokenUrl) {
      try {
        const resp = await axios.get(accessTokenUrl, { 
          params: { "access_token": User.$state.orcidAccessToken }
        })
        if (resp.status === 200) {
          const token = resp.data.access_token // TODO: also need its expiration date!
          this.commit((state) => {
            state.accessToken = token || ''
          })
        }
      }
      catch(e) {
        this.commit((state) => {
          state.accessToken = ''
        })
        // console.error(this.get()?.key + ': failed to fetch access token. ', e)
      }
    }
  }

  static get(): Repository | null {
    return Repository.query().where('key', this.entity).withAll().first()
  }

  static async updateCzHubRecord(recordId: string, repository: string) {
    try {
      const response = await axios.put(`/api/submit/${repository}/${recordId}`)
      await Submission.insertOrUpdate({ data: Submission.getInsertData(response.data) }) 
    }
    catch(e) {
      CzNotification.toast({ message: 'Failed to update record' })
    }
  }

  static async deleteSubmission(identifier: string, repository: string) {
    await Submission.delete([identifier, repository])
    CzNotification.toast({ message: 'Your submission has been deleted' })
  }

  protected static createSubmission: (data?: any) => Promise<{ recordId: string, formMetadata: any} | null>
  protected static deleteRecord: (recordId: string, repository: string) => Promise<any>
  protected static read: (recordId: string) => Promise<any>
  protected static updateRepositoryRecord: (recordId: string, metadata: any) => Promise<any>
}