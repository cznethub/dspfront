import type { EnumRepositoryKeys } from '~/components/submissions/types'
import { useRepositoryStore } from '~/stores/repository.store'

/**
 * Returns whether the repository has been authorized or not.
 * If promptAuthorize is `true`, also opens the authorization window if repository was not authorized.
 */
export function isRepositoryAuthorized(
  repository: EnumRepositoryKeys,
  promptAuthorize: boolean = true,
): boolean {
  const repositoryStore = useRepositoryStore()

  if (!repositoryStore.isAuthorized(repository)) {
    if (promptAuthorize)
      repositoryStore.openAuthorizeDialog(repository)

    return false
  }

  return true
}
