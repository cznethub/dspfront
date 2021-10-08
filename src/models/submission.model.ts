import { SUBMISSIONS } from '@/components/submissions/submissions.mock'
import { ISubmission, EnumRepositories, EnumSubmissionStatus } from '@/components/submissions/types'
import { Model } from '@vuex-orm/core'

export default class Submission extends Model implements ISubmission {
  // This is the name used as module name of the Vuex Store.
  static entity = 'submissions'
  public title!: string
  public authors!: string[]
  public repository!: EnumRepositories
  public date!: Date
  public status!: EnumSubmissionStatus
  public identifier!: string

  // List of all fields (schema) of the post model. `this.attr` is used
  // for the generic field type. The argument is the default value.
  static fields () {
    return {
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
    // TODO: implement any necessary transformations here
    return apiSubmission
  }

  static fetchSubmissions() {
    let data = SUBMISSIONS  // replace for api call
    data = data.map(this.getInsertData)
    this.insert({ data })
  }
}