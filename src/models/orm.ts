import VuexORM from '@vuex-orm/core'
import User from '@/models/user.model'
import Submission from '@/models/submission.model'
import Repository from './repository.model'
import Zenodo from './zenodo.model'

/**
 * Register all the Models here.
 * https://vuex-orm.org/guide
 */

const db = new VuexORM.Database()
db.register(User)
db.register(Submission)
db.register(Repository)
db.register(Zenodo)
export const orm = db
