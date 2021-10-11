
import { EnumRepositoryKeys, IRepository, IRepositoryUrls } from '@/components/submissions/types'
import { repoMetadata } from '@/components/submit/constants'
import axios from "axios"
import Repository from './repository.model'

export default class Zenodo extends Repository implements IRepository {
  static entity = EnumRepositoryKeys.zenodo

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
      const newZenodoRepo: IRepository = {
        ...repoMetadata[4],
      }

      this.insert({ data : newZenodoRepo })
    }

    // TODO: decide how often to fetch these data
    // Fetch urls and schema if not populated yet
    const zenodo = this.get()
    if (!(zenodo && zenodo.urls && Object.keys(zenodo.urls).length)) {
      const urls: IRepositoryUrls | undefined = await Zenodo.getUrls()
      const schema: any = await Zenodo.getSchema(urls?.schemaUrl)

      Zenodo.update({
        where: Zenodo.entity,
        data: { urls, schema }
      })

      Zenodo.fetchAccessToken()
    }
  }

  static async getSchema(schemaUrl: string | undefined) {
    if (!schemaUrl) {
      return undefined
    }

    return await axios.get(schemaUrl)
  }

  static async getUrls(): Promise<undefined | IRepositoryUrls> {
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

  static async fetchAccessToken() {
    const accessTokenUrl = Zenodo.get()?.urls?.accessTokenUrl
    if (accessTokenUrl) {
      try {
        const resp = await axios.get(accessTokenUrl)
        const token = resp.data.token // TODO: also need its expiration date!
        Zenodo.commit((state) => {
          state.accessToken = token
        })
      }
      catch(e) {
        console.error('Zenodo: failed to fetch access token. ', e)
      }
    }
  }

  static get(): Repository | null {
    return this.query().withAll().first()
  }
}