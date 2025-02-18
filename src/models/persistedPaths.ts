import EarthChem from './earthchem.model'
import External from './external.model'
// import Zenodo from './zenodo.model'
import HydroShare from './hydroshare.model'
import Repository from './repository.model'
import Submission from './submission.model'
import User from './user.model'

export const persistedPaths = [
  `entities.${User.entity}`,
  `entities.${Repository.entity}`,
  // `entities.${Zenodo.entity}`,
  `entities.${HydroShare.entity}`,
  `entities.${EarthChem.entity}`,
  `entities.${External.entity}`,
  `entities.${Submission.entity}.sortBy`,
  `entities.${Submission.entity}.sortDirection`,
  `entities.${Submission.entity}.itemsPerPage`,
]
