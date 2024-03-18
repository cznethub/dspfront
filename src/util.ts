import type { EnumRepositoryKeys } from '~/components/submissions/types'
import { supportedRepositoryModels } from '~/constants'
import Repository from '~/models/repository.model'
import External from '~/models/external.model'

/**
 * Returns whether the repository has been authorized or not.
 * If promptAuthorize is `true`, also opens the authorization window if repository was not authorized.
 */
export function isRepositoryAuthorized(
  repository: EnumRepositoryKeys,
  promptAuthorize: boolean = true,
) {
  const activeRepository = supportedRepositoryModels[repository]

  if (
    activeRepository
    && activeRepository !== External
    && !activeRepository?.$state.accessToken
  ) {
    if (promptAuthorize)
      Repository.openAuthorizeDialog(repository)

    return false
  }

  return true
}
