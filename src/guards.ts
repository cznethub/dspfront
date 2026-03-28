import { Notifications } from '@cznethub/cznet-vue-core'
import type { NavigationGuard, RouteLocationRaw } from 'vue-router'
import { useUserStore } from '~/stores/user.store'
import { useRepositoryStore } from '~/stores/repository.store'
import type { EnumRepositoryKeys } from '~/components/submissions/types'

export const hasNextRouteGuard: NavigationGuard = () => {
  const userStore = useUserStore()
  const nextRoute = userStore.next
  if (nextRoute) {
    // Consume the redirect
    userStore.next = ''
    return { path: nextRoute } satisfies RouteLocationRaw
  }
}

export const hasLoggedInGuard: NavigationGuard = (to, _from, next) => {
  const userStore = useUserStore()
  if (!userStore.isLoggedIn) {
    userStore.openLogInDialog({ path: to.path })
    next({ name: 'home' })
  }
  else {
    next()
  }
}

export const hasUnsavedChangesGuard: NavigationGuard = (to, _from, next) => {
  const userStore = useUserStore()
  if (userStore.hasUnsavedChanges) {
    Notifications.openDialog({
      title: 'You have unsaved changes',
      content: 'Do you want to continue and discard your changes?',
      confirmText: 'Discard',
      cancelText: 'Cancel',
      onConfirm: async () => {
        userStore.hasUnsavedChanges = false
        next({ path: to.path })
      },
    })
  }
  else {
    next()
  }
}

export const hasAccessTokenGuard: NavigationGuard = (to, _from, next) => {
  const repositoryStore = useRepositoryStore()
  const userStore = useUserStore()
  const repoKey = to.params.repository as EnumRepositoryKeys
  if (
    !repositoryStore.isAuthorized(repoKey)
    && userStore.isLoggedIn
  ) {
    repositoryStore.openAuthorizeDialog(repoKey, { path: to.path })
  }
  else {
    next()
  }
}
