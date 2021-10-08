import VuexORM from '@vuex-orm/core'
import User from '@/models/user.model'
import Submission from '@/models/submission.model'

/**
 * Register all the Models here.
 * https://vuex-orm.org/guide
 */

const db = new VuexORM.Database()
db.register(User)
db.register(Submission)
export const orm = db
