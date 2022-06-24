import { Model } from '@vuex-orm/core'
import { EnumRepositoryKeys, IRepository, IRepositoryUrls } from '@/components/submissions/types'
import { repoMetadata } from "@/components/submit/constants"
import { Subject } from 'rxjs'
import { RawLocation } from 'vue-router'
import { IFile, IFolder } from '@/components/new-submission/types'
import { DELETED_RESOURCE_STATUS_CODES } from '@/constants'
import axios from "axios"
import Submission from './submission.model'
import CzNotification from './notifications.model'
import User from './user.model'

export default class Repository extends Model implements IRepository {
  static entity = 'repository'
  static primaryKey = 'key'
  static isAuthorizeListenerSet = false
  static authorizeDialog$ = new Subject<{ repository: string, redirectTo?: RawLocation | undefined }>()
  static authorized$ = new Subject<EnumRepositoryKeys>()
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
  //     [EarthChem.entity]: EarthChem,
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

    await this.fetchAccessToken()
  }

  static openAuthorizeDialog(repository: string, redirectTo?: RawLocation) {
    this.authorizeDialog$.next({ repository, redirectTo })
  }

  static async authorize(activeRepository: typeof Repository, callback?: () => any) {
    const authorizeUrl = activeRepository?.get()?.urls?.authorizeUrl

    if (!authorizeUrl) {
      CzNotification.toast({
        message: 'Failed to authorize repository',
        type: 'error'
      })
      return
    }

    window.open(
      `${window.location.origin}${authorizeUrl}`,
      "_blank",
      "location=1,status=1,scrollbars=1, width=800,height=800"
    )

    if (!this.isAuthorizeListenerSet) {
      window.addEventListener("message", async (message) => {
        this.isAuthorizeListenerSet = true // Prevents registering the listener more than once
        console.info(`Repository: listening to authorization window...`)

        if (message.data.token) {
          activeRepository.commit((state) => {
            state.accessToken = message.data.token.access_token || ''
          })

          if (callback) {
            callback()
          }
          this.authorized$.next(this.entity as EnumRepositoryKeys)
        }
        else {
          CzNotification.toast({
            message: 'Failed to authorize repository',
            type: 'error'
          })
        }
      })
    }
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
        folderCreateUrl: resp.data.folder_create,
        folderReadUrl: resp.data.folder_read,
        folderDeleteUrl: resp.data.folder_delete,
        moveOrRenameUrl: resp.data.move_or_rename_url,  // TODO: split into two in the backend (move and rename)
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
    const accessTokenUrl = this.get()?.urls?.accessTokenUrl
    if (accessTokenUrl) {
      console.info(this.get()?.key + ": Fetching access token...")
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
      catch(e: any) {
        this.commit((state) => {
          state.accessToken = ''
        })
        if (e.response?.status === 404) {
          // Token not set
        }
        else {
          console.error(this.get()?.key + ': failed to fetch access token. ', e)
        }
      }
    }
  }

  static get(): Repository | null {
    return Repository.query().where('key', this.entity).withAll().first()
  }

    /** 
   * Creates a submission
   * @param {object} data - the form data to be saved
   * @param {string} repository - the repository key
  */
  static async createSubmission(data: any, repository: string): Promise<{ identifier: string, formMetadata: any } | null> {
    console.info(`${repository}: Creating submission...`)
    
    try {
      const response = await axios.post(
        `/api/metadata/${repository}`,
        data,
        { 
          headers: { "Content-Type": "application/json"},
          params: { "access_token": User.$state.orcidAccessToken }
        }
      )
      if (response?.status === 201) {
        // TODO: get these identifiers from the backend
        let identifier = ''
        switch (this.entity) {
          case EnumRepositoryKeys.hydroshare:
            identifier = response.data.identifier?.split('/').pop()
            break
          case EnumRepositoryKeys.zenodo:
            identifier = response.data.prereserve_doi?.recid
            break
          case EnumRepositoryKeys.earthchem:
            identifier = response.data.id
            break
          case EnumRepositoryKeys.external:
            identifier = response.data.identifier
            break
        }

        return {
          identifier,
          formMetadata: response.data
        }
      }
    }
    catch(e: any) {
      if (e.response?.status === 401 || e.response?.status === 403) {
        // Token has expired
        this.commit((state) => {
          state.accessToken = ''
        })

        CzNotification.toast({
          message: 'Authorization token is invalid or has expired.',
          type: 'error'
        })

        Repository.openAuthorizeDialog(this.entity)
      }
      else {
        CzNotification.toast({
          message: 'Failed to create submission',
          type: 'error'
        })
        console.error(`${repository}: failed to create submission.`, e.response)
      }
      throw(e)
    }
    return null
  }

  /** 
   * Updates a submission
   * @param {string} identifier - the identifier of the resource in the repository
   * @param {any} data - the form data to be saved
  */
  static async updateSubmission(identifier: string, data: any) {
    try {
      const response = await axios.put(
        `/api/metadata/${this.entity}/${identifier}`,
        data, { 
          headers: { "Content-Type": "application/json"},
          params: { "access_token": User.$state.orcidAccessToken },
        }
      )
      return response.status === 200
    }
    catch(e: any) {
      console.log(e)
      return false
    }
  }

  /** 
   * Refetches a submission from the repository and updates it in ORM
   * @param {string} identifier - the identifier of the resource in the repository
   * @param {string} repositiry - the repository key
  */
  static async refetchSubmission(identifier: string, repository: EnumRepositoryKeys) {
    try {
      const response = await axios.get(`/api/metadata/${repository}/${identifier}`, {
        params: { "access_token": User.$state.orcidAccessToken },
      })
      await Submission.insertOrUpdate({ data: Submission.getInsertData(response.data, repository, identifier) })
      CzNotification.toast({
        message: 'Your submission has been reloaded with its latest changes',
        type: 'success'
      })
    }
    catch(e: any) {
      console.log(e)
      if (e.response?.status === 401) {
        // Token has expired
        this.commit((state) => {
          state.accessToken = ''
        })
        CzNotification.toast({
          message: 'Authorization token is invalid or has expired.',
          type: 'error'
        })

        Repository.openAuthorizeDialog(this.entity)
      }
      else if (DELETED_RESOURCE_STATUS_CODES.includes(e.response?.status)) {
        // Resource has been deleted in repository
        CzNotification.openDialog({
          title: "This resource has been deleted",
          content: "The resource you requested does not exist in the remote repository. It may have been deleted outside of the Data Submission Portal. Do you want to remove it from your list of submissions?",
          confirmText: "Remove",
          cancelText: 'Cancel',
          onConfirm: async () => {
            await this.deleteSubmission(identifier, repository)
          }
        })
      }
      else {
        console.error(`${repository}: failed to update submission.`, e.response)
      }
      CzNotification.toast({
        message: 'Failed to update record',
        type: 'error'
      })
    }
  }

  /** 
   * Deletes a submission
   * @param {string} identifier - the identifier of the resource in the repository
   * @param {string} repositiry - the repository key
  */
  static async deleteSubmission(identifier: string, repository: string) {
    try {
      const response = await axios.delete(`/api/metadata/${repository}/${identifier}`, { 
        params: { "access_token": User.$state.orcidAccessToken }
      })
  
      if (response.status === 200) {
        await Submission.delete([identifier, repository])
        CzNotification.toast({
          message: 'Your submission has been deleted',
          type: 'success'
        })
      }
    }
    catch(e: any) {
      CzNotification.toast({
        message: 'Failed to delete submission',
        type: 'error'
      })

      if (e.response?.status === 401) {
        // Token has expired
        this.commit((state) => {
          state.accessToken = ''
        })
        CzNotification.toast({
          message: 'Authorization token is invalid or has expired.',
          type: 'error'
        })

        Repository.openAuthorizeDialog(this.entity)
      }
      else if (DELETED_RESOURCE_STATUS_CODES.includes(e.response?.status)) {
        // Resource has been deleted in the repository
        await Submission.delete([identifier, repository])
        CzNotification.toast({
          message: 'Your submission has been deleted',
          type: 'success'
        })
      }
      else {
        console.error(`${repository}: failed to delete submission.`, e.response)
      }
    }
  }

  /** 
   * Reads a submission
   * @param {string} identifier - the identifier of the resource in the repository
   * @param {string} repositiry - the repository key
  */
  static async readSubmission(identifier: string, repository: string) {
    try {
      const response = await axios.get(
        `/api/metadata/${repository}/${identifier}`, 
        { params: { "access_token": User.$state.orcidAccessToken } 
      })

      if (response.status === 200) {
        return response.data
      }
      else {
        CzNotification.toast({
          message: 'Failed to load submission',
          type: 'error'
        })
        return null
      }
    }
    catch(e: any) {
      if (e.response.status === 401) {
        // Token has expired
        this.commit((state) => {
          state.accessToken = ''
        })
        
        CzNotification.toast({
          message: 'Authorization token is invalid or has expired.',
          type: 'error'
        })

        Repository.openAuthorizeDialog(repository)
        return e.response.status
      }
      else if (e.response?.status === 403) {
        // Submission might have been deleted or service unavailable
        CzNotification.toast({
          message: 'Failed to load submission',
          type: 'error'
        })
        return e.response.status
      }
      else if (DELETED_RESOURCE_STATUS_CODES.includes(e.response?.status)) {
        // Resource has been deleted in repository
        // Error handled in component
        return e.response.status
      }
      else {
        console.error(`${repository}: failed to read submission.`, e.response)
        return null
      }
    }
  }

  static uploadFiles: (bucketUrl: string, itemsToUpload: (IFile | IFolder)[] | any[], createFolderUrl: string) => Promise<any>
  static readRootFolder: (identifier: string, path: string, rootDirectory: IFolder) => Promise<(IFile | IFolder)[]>
  static deleteFileOrFolder: (identifier: string, item: IFile | IFolder) => Promise<boolean>
  static renameFileOrFolder: (identifier: string, item: IFile | IFolder, newPath: string) => Promise<boolean>
}
