import { ISubmission, EnumRepositoryKeys } from '@/components/submissions/types'
import { Model } from '@vuex-orm/core'
import axios from "axios"
import User from './user.model'

// temporary workaround to circular dependecy error
function getViewUrl(identifier: string, repo: EnumRepositoryKeys) {
  if (repo === EnumRepositoryKeys.hydroshare) {
    return `https://beta.hydroshare.org/resource/${identifier}`
  }
  else if (repo === EnumRepositoryKeys.zenodo) {
    return  `https://sandbox.zenodo.org/deposit/${identifier}`
  }
  return ''
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

  static get $state() {
    return this.store().state.entities[this.entity]
  }

  static state() {
    return {
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
      url: this.attr('')
    }
  }

  // Used to transform submission data that comes from CzHub database
  static getInsertData(apiSubmission): ISubmission {
    return {
      title: apiSubmission.title,
      authors: [],
      repository: apiSubmission.repo_type,
      date: new Date(apiSubmission.submitted).getTime(),
      identifier: apiSubmission.identifier,
      url: getViewUrl(apiSubmission.identifier, apiSubmission.repo_type)  // TODO: Get from model after fixing circular dependency issue
    }
  }

  static async fetchSubmissions() {
    console.log("Fetching submissions...")
    try {
      this.commit((state) => {
        return state.isFetching = true
      })
      
      const resp = await axios.get('/api/submissions', { 
        params: { "access_token": User.$state.orcidAccessToken }
      })

      if (resp.status === 200) {
        let data = resp.data as any[]
        data = data.map(this.getInsertData)
        this.insertOrUpdate({ data })
      }
      else if (resp.status === 401) {
        // User has been logged out
        User.logOut()
      }
      this.commit((state) => {
        return state.isFetching = false
      })
      return resp.status
    }
    catch(e: any) {
      this.commit((state) => {
        return state.isFetching = false
      })
      return e.response.status
    }
  }
}
