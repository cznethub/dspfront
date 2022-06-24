import { ISubmission, EnumRepositoryKeys } from '@/components/submissions/types'
import { Model } from '@vuex-orm/core'
import axios from "axios"
import User from './user.model'
import {
  EnumSubmissionSorts,
  EnumSortDirections,
} from "@/components/submissions/types"
import { itemsPerPageArray } from '@/components/submissions/constants'

// temporary workaround to circular dependecy error
function getViewUrl(identifier: string, repo: EnumRepositoryKeys) {
  if (repo === EnumRepositoryKeys.hydroshare) {
    return `https://beta.hydroshare.org/resource/${identifier}`
  }
  else if (repo === EnumRepositoryKeys.zenodo) {
    return  `https://sandbox.zenodo.org/deposit/${identifier}`
  }
  else if (repo === EnumRepositoryKeys.earthchem) {
    return  `https://ecl.earthchem.org/view.php?id=${identifier}`
  }
  else if (repo === EnumRepositoryKeys.external) {
    return  `/api/metadata/external/${identifier}`
  }
  return ''
}

export interface ISubmisionState {
  sortBy: { key: string, label: string },
  sortDirection: { key: string, label: string },
  itemsPerPage: number
  isFetching: boolean
}

export default class Submission extends Model implements ISubmission {
  // This is the name used as module name of the Vuex Store.
  static entity = 'submissions'
  static primaryKey = ['identifier', 'repository']
  public title!: string
  public authors!: string[]
  public repository!: EnumRepositoryKeys
  public date!: number
  public identifier!: string
  public url!: string
  public metadata!: any

  static get $state(): ISubmisionState {
    return this.store().state.entities[this.entity]
  }

  static state() {
    return {
      sortBy: { key: 'date', label: EnumSubmissionSorts.date },
      sortDirection: { 'desc': '', label: EnumSortDirections.desc },
      itemsPerPage: itemsPerPageArray[0],
      isFetching: false
    }
  }

  // List of all fields (schema) of the post model. `this.attr` is used
  // for the generic field type. The argument is the default value.
  static fields () {
    return {
      id: this.number(0),
      title: this.attr(''),
      repository: this.attr(''),
      authors: this.attr([]),
      // @ts-ignore
      date: this.number(0),
      identifier: this.attr(''),
      url: this.attr(''),
      metadata: this.attr({})
    }
  }

  static getInsertDataFromDb(dbSubmission) {
    return {
      title: dbSubmission.title,
      authors: dbSubmission.authors.map(a => a.name),
      repository: dbSubmission.repo_type,
      date: new Date(dbSubmission.submitted).getTime(),
      identifier: dbSubmission.identifier,
      metadata: JSON.parse(dbSubmission.metadata_json),
      url: dbSubmission.url
    }
  }

  // Used to transform submission data that comes from the repository API
  // TODO: this should be moved as a dedicated method on each repository model
  static getInsertData(apiSubmission, repository: EnumRepositoryKeys, identifier: string): ISubmission | Partial<Submission> {
    if (repository === EnumRepositoryKeys.hydroshare) {
      return {
        title: apiSubmission.title,
        authors: apiSubmission.creators.map(c => c.name),
        repository: repository,
        // Do not override the date we stored on creation. The one HydroShare stores has a different timezone
        // date: new Date(apiSubmission.created).getTime(), 
        identifier: identifier,
        metadata: {},
        // url: apiSubmission.url
      }
    }
    else if (repository === EnumRepositoryKeys.zenodo) {
      return {
        title: apiSubmission.title,
        authors: apiSubmission.creators?.map(c => c.name),
        repository: repository,
        // Zenodo returns a date, and we need a datetime, so we don't override the one we stored on creation
        // date: 
        identifier: identifier,
        url: getViewUrl(identifier, repository)  // TODO: Get from model after fixing circular dependency issue
      }
    }
    else if (repository === EnumRepositoryKeys.earthchem) {
      return {
        title: apiSubmission.title,
        authors: apiSubmission.creators?.map(a => `${a.familyName}, ${a.givenName}`),
        repository: repository,
        identifier: identifier,
        url: getViewUrl(identifier, repository)  // TODO: Get from model after fixing circular dependency issue
      }
    }
    else if (repository === EnumRepositoryKeys.external) {
      // Not applicable
    }

    // default
    return {
      title: apiSubmission.title,
      authors: apiSubmission.authors,
      repository: apiSubmission.repo_type,
      date: new Date(apiSubmission.submitted).getTime(),
      identifier: apiSubmission.identifier,
      url: getViewUrl(identifier, apiSubmission.repo_type),  // TODO: Get from model after fixing circular dependency issue
      metadata: {}
    }
  }

  static async fetchSubmissions() {
    console.log("Fetching submissions...")
    try {
      this.commit((state) => {
        return state.isFetching = true
      })
      
      const response = await axios.get('/api/submissions', { 
        params: { "access_token": User.$state.orcidAccessToken }
      })

      if (response.status === 200) {
        let data = response.data as any[]
        data = data.map(this.getInsertDataFromDb)
        this.insertOrUpdate({ data })
      }
      else if (response.status === 401) {
        // User has been logged out
        User.logOut()
      }
      this.commit((state) => {
        return state.isFetching = false
      })
      return response.status
    }
    catch(e: any) {
      this.commit((state) => {
        return state.isFetching = false
      })
      return e.response.status
    }
  }
}
