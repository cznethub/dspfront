import { Model } from '@vuex-orm/core'
import { EnumRepositoryKeys, IRepository, IRepositoryUrls } from '@/components/submissions/types'
import { repoMetadata } from "@/components/submit/constants";
import axios from "axios";
import Zenodo from './zenodo.model';

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
    // TODO: should we initialize repos on app start in case we change urls?
    if (!(this.get())) {
      console.info(`Repository: Initializing ${this.entity} for the first time...`)
      const newRepo: IRepository = {
        ...repoMetadata[this.entity],
      }

      Repository.insert({ data : newRepo })
    }

    // Fetch urls and schema if not populated yet
    const repository = this.get()
    if (!(repository?.urls && Object.keys(repository.urls).length)) {
      const urls: IRepositoryUrls | undefined = await this.getUrls()
      // Do we want to load the schema every time to keep it updated?
      const schema: any = await this.getJson(urls?.schemaUrl)
      const uischema: any = await this.getJson(urls?.uischemaUrl)
      const schemaDefaults: any = await this.getJson(urls?.schemaDefaultsUrl)

      this.update({
        where: this.entity,
        data: { urls, schema, uischema, schemaDefaults }
      })
    }

    // If we don't have an access token stored, fetch one using the accessTokenUrl
    // TODO: also check if it expired, and if so refresh it
    if (!(this.isAuthorized) && repository?.urls?.accessTokenUrl) {
      await this.fetchAccessToken()
    }
  }

  protected static async getJson(jsonUrl: string | undefined) {
    if (!jsonUrl) {
      return undefined
    }

    const resp = await axios.get(jsonUrl)

    if (resp.status === 200) {
      return resp.data
    }
  }

  protected static async getUrls(): Promise<undefined | IRepositoryUrls> {
    try {
      const resp = await axios.get("/api/urls/" + this.get()?.key)

      return {
        schemaUrl: resp.data.schema,
        uischemaUrl: resp.data.uischema,
        schemaDefaultsUrl: resp.data.schema_defaults,
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
      console.error(this.get()?.key + ': Failed to fetch repository Urls', e)
      return undefined
    }
  }

  private static async fetchAccessToken() {
    console.info(this.get()?.key + ": Fetching access token...")
    const accessTokenUrl = this.get()?.urls?.accessTokenUrl
    if (accessTokenUrl) {
      try {
        const resp = await axios.get(accessTokenUrl)
        if (resp.status === 200) {
          const token = resp.data.access_token // TODO: also need its expiration date!
          this.commit((state) => {
            state.accessToken = token
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

  protected static createSubmission: (data?: any) => Promise<{ recordId: string, formMetadata: any} | null>
}