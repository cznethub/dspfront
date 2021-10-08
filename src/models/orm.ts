import VuexORM from '@vuex-orm/core'
import User from '@/models/user.model'
import Submission from '@/models/submission.model'

/**
 * Register all the Models here.
 * https://vuex-orm.org/guide
 *
 * Use them in your components like:
 * ```this.$model( ModelClass ).xxxx``` instead of using the imported class directly!
 */

const db = new VuexORM.Database()
db.register(User)
db.register(Submission)
export const orm = db
