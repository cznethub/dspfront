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

export const hasLoggedInGuard: NavigationGuard = (to, from, _next) => {
  if (to.meta?.hasLoggedInGuard && !User.$state.isLoggedIn) {
    User.openLogInDialog({ path: to.path })
    return from?.path ?? false
  }
}

export const hasAccessTokenGuard: NavigationGuard = (to, from, _next) => {
  if (to.meta?.hasAccessTokenGuard) {
    if (
      !isRepositoryAuthorized(to.params.repository as EnumRepositoryKeys, false)
      && User.$state.isLoggedIn
    ) {
      Repository.openAuthorizeDialog(to.params.repository as EnumRepositoryKeys, { path: to.path })
      return from
    }
  }
}

export const hasUnsavedChangesGuard: NavigationGuard = (to, from, _next) => {
  if (from?.meta?.hasUnsavedChangesGuard && User.$state.hasUnsavedChanges) {
    Notifications.openDialog({
      title: 'You have unsaved changes',
      content: 'Do you want to continue and discard your changes?',
      confirmText: 'Discard',
      cancelText: 'Cancel',
      onConfirm: async () => {
        User.commit((state) => {
          state.hasUnsavedChanges = false
        })
        await useRouter().push(to.path)
      },
    })
    return from
  }
}

export const addRouteTags: NavigationGuard = (to, from, _next) => {
  // This goes through the matched routes from last to first, finding the closest route with a title.
  // e.g., if we have `/some/deep/nested/route` and `/some`, `/deep`, and `/nested` have titles,
  // `/nested`'s will be chosen.
  const nearestWithTitle = to.matched
    .slice()
    .reverse()
    .find(r => r.meta && r.meta.title)

  // Find the nearest route element with meta tags.
  const nearestWithMeta = to.matched
    .slice()
    .reverse()
    .find(r => r.meta && r.meta.metaTags)

  const previousNearestWithMeta = from?.matched
    .slice()
    .reverse()
    .find(r => r.meta && r.meta.metaTags)

  const { t } = useI18n()

  // If a route with a title was found, set the document (page) title to that value.
  if (nearestWithTitle)
    document.title = `${t(`hubName`)} | ${nearestWithTitle.meta.title}`

  else if (previousNearestWithMeta)
    document.title = previousNearestWithMeta.meta.title as string

  else document.title = `${t(`hubName`)}`

  // Remove any stale meta tags from the document using the key attribute we set below.
  Array.from(document.querySelectorAll('[data-vue-router-controlled]')).map(
    el => el.parentNode?.removeChild(el),
  )

  // Skip rendering meta tags if there are none.
  if (!nearestWithMeta)
    return false

  // Turn the meta tag definitions into actual elements in the head.
  ;(nearestWithMeta.meta.metaTags as { name: string, content: string }[])
    .map((tagDef: any) => {
      const tag = document.createElement('meta')

      Object.keys(tagDef).forEach((key) => {
        tag.setAttribute(key, tagDef[key])
      })

      // We use this to track which meta tags we create so we don't interfere with other ones.
      tag.setAttribute('data-vue-router-controlled', '')

      return tag
    })
    // Add the meta tags to the document head.
    .forEach(tag => document.head.appendChild(tag))
}
