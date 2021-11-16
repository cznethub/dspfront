import { ISubmission, EnumSubmissionStatus, EnumRepositoryKeys } from '@/components/submissions/types'
import { Model } from '@vuex-orm/core'
import axios from "axios"

export default class Submission extends Model implements ISubmission {
  // This is the name used as module name of the Vuex Store.
  static entity = 'submissions'
  static primaryKey = 'id'
  public id!: number
  public title!: string
  public authors!: string[]
  public repository!: EnumRepositoryKeys
  public date!: Date
  public status!: EnumSubmissionStatus
  public identifier!: string

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
      date: this.date(null),
      status: this.attr(''),
      identifier: this.attr('')
    }
  }

  static getInsertData(apiSubmission): ISubmission {
    return {
      id: apiSubmission.id,
      title: apiSubmission.title,
      authors: [],
      repository: apiSubmission.repo_type,
      date: apiSubmission.submitted,
      status: apiSubmission.status,
      identifier: apiSubmission.identifier,
    }
  }

  static async fetchSubmissions() {
    try {
      this.commit((state) => {
        return state.isFetching = true
      })
      let resp = await axios.get('/api/submissions')
      if (resp.status === 200) {
        let data = resp.data as any[]
        data = data.map(this.getInsertData)
        this.insertOrUpdate({ data })
      }
      this.commit((state) => {
        return state.isFetching = false
      })
    }
    catch(e: any) {
      if (e.response.status === 401) {
        // Unauthorized
      }
      console.error(e)
    }
  }
}