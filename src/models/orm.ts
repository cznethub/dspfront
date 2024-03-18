import VuexORM from '@vuex-orm/core'
import Repository from './repository.model'
import Zenodo from './zenodo.model'
import HydroShare from './hydroshare.model'
import External from './external.model'
import EarthChem from './earthchem.model'
import Submission from './submission.model'
import User from './user.model'

/**
 * Register all the Models here.
 * https://vuex-orm.org/guide
 */

const db = new VuexORM.Database()

db.register(User)
db.register(Submission)
db.register(Repository)
db.register(Zenodo)
db.register(HydroShare)
db.register(EarthChem)
db.register(External)

export const orm = db
