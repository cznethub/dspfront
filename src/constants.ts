import { EnumRepositoryKeys } from "./components/submissions/types"
import EarthChem from "./models/earthchem.model"
import External from "./models/external.model"
import HydroShare from "./models/hydroshare.model"
import Repository from "./models/repository.model"
import Zenodo from "./models/zenodo.model"

/** 
 * Status codeds returned by repositories when the resource has been deleted from their sites 
 * Endpoint: /api/metadata/${repository}/${identifier}
 * */
 export const DELETED_RESOURCE_STATUS_CODES = [
  404,  // HydroShare
  410,  // Zenodo
]
export const APP_NAME = 'CZ'
export const DEFAULT_TOAST_DURATION = 3500

export function getRepositoryFromKey(key: string): typeof Repository | undefined {
  switch (key) {
    case EnumRepositoryKeys.hydroshare: return HydroShare
    case EnumRepositoryKeys.zenodo: return Zenodo
    case EnumRepositoryKeys.earthchem: return EarthChem
    case EnumRepositoryKeys.external: return External
  }
}