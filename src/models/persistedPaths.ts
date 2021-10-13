import User from "./user.model";
import Zenodo from "./zenodo.model";

export const persistedPaths = [
  'entities.' + User.entity,
  'entities.' + Zenodo.entity,
]