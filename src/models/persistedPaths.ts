import User from "./user.model";
import Zenodo from "./zenodo.model";
import HydroShare from "./hydroshare.model";
import Repository from "./repository.model";
import External from "./external.model";

export const persistedPaths = [
  'entities.' + User.entity,
  'entities.' + Repository.entity,
  'entities.' + Zenodo.entity,
  'entities.' + HydroShare.entity,
  'entities.' + External.entity,
]