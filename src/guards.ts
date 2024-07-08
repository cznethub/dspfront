import { Notifications } from '@cznethub/cznet-vue-core'
import type { NavigationGuard, RouteLocationRaw } from 'vue-router'
import { isRepositoryAuthorized } from './util'
import User from './models/user.model'
import Repository from './models/repository.model'
import type { EnumRepositoryKeys } from '~/components/submissions/types'

export const hasNextRouteGuard: NavigationGuard = () => {
  const nextRoute = User.$state.next
  if (nextRoute) {
    // Consume the redirect
    User.commit((state) => {
      state.next = ''
    })
    return { path: nextRoute } satisfies RouteLocationRaw
  }
}

export const hasLoggedInGuard: NavigationGuard = (to, _from, next) => {
  if (!User.$state.isLoggedIn) {
    User.openLogInDialog({ path: to.path })
    next({ name: 'home' })
  }
  else {
    next()
  };
}

export const hasUnsavedChangesGuard: NavigationGuard = (to, _from, next) => {
  if (User.$state.hasUnsavedChanges) {
    Notifications.openDialog({
      title: 'You have unsaved changes',
      content: 'Do you want to continue and discard your changes?',
      confirmText: 'Discard',
      cancelText: 'Cancel',
      onConfirm: async () => {
        await User.commit((state) => {
          state.hasUnsavedChanges = false
        })
        next({ path: to.path })
      },
    })
  }
  else {
    next()
  }
}

export const hasAccessTokenGuard: NavigationGuard = (to, _from, next) => {
  if (
    !(isRepositoryAuthorized(to.params.repository as EnumRepositoryKeys, false))
    && User.$state.isLoggedIn
  ) {
    Repository.openAuthorizeDialog(to.params.repository as EnumRepositoryKeys, { path: to.path })
  }

  else {
    next()
  }
}
