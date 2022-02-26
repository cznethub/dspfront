import { routes } from './routes'
import { EnumRepositoryKeys } from './components/submissions/types'
import VueRouter, { RawLocation } from 'vue-router'
import User from './models/user.model'
import HydroShare from './models/hydroshare.model'
import Repository from './models/repository.model'
import Zenodo from './models/zenodo.model'
import External from './models/external.model'

export const router = new VueRouter({
  mode: 'history',
  routes,
  scrollBehavior(to, from, savedPosition) {
    document.getElementsByTagName('html')[0]?.scrollTo({ left: 0, top: 0});
  }
})

/** Guards are executed in the order they appear in this array */
const guards: ((to, from?, next?) => RawLocation | null)[] = [
  // hasNextRouteGuard
  (to, from?): RawLocation | null =>  {
    const nextRoute = User.$state.next
    if (nextRoute) {
      // Consume the redirect
      User.commit((state) => {
        state.next = ''
      })
      return { path: nextRoute }
    }

    return null
  },

  // hasLoggedInGuard
  (to, from?, next?): RawLocation | null => {
    if (to.meta?.hasLoggedInGuard && !User.$state.isLoggedIn) {
      User.openLogInDialog({ path: to.path })
      return from
    }

    return null
  },

  // hasAccessTokenGuard
  (to, from?): RawLocation | null => {
    if (to.meta?.hasAccessTokenGuard) {
      let activeRepository: typeof Repository | null = null
      const repo = to.params.repository

      switch (repo) {
        case EnumRepositoryKeys.hydroshare: activeRepository = HydroShare; break;
        case EnumRepositoryKeys.zenodo: activeRepository = Zenodo; break;
        case EnumRepositoryKeys.external: activeRepository = External; break;
        default: activeRepository = HydroShare
      }

      if (activeRepository !== External && !(activeRepository?.$state.accessToken)) {
        Repository.openAuthorizeDialog(repo, { path: to.path })
        return from
      }
    }

    return null
  }
]

export function setupRouteGuards() {
  router.beforeEach((to, from, next) => {
    console.log("Router beforeEach: ", to)
    next()
  })

  guards.map((fn: (to, from?, next?) => RawLocation | null) => {
    router.beforeEach((to, from, next) => {
      const activatedRouteGuard = fn(to, from, next)
      if (activatedRouteGuard) {
        next(activatedRouteGuard)
      }
      else {
        next()
      }
    })
  })

  checkGuardsOnce()
}

/** Call before navigating to an external url to save the next route in state and navigate to it after callback url */
export function saveNextRoute() {
  const next = router.currentRoute.query.next
  if (next) {
    User.commit((state) => {
      state.next = next
    })
  }
}

// Call this manually immediately after guards are setup to check guards on the page that loaded on app start.
function checkGuardsOnce() {
  let activatedGuardRoute: RawLocation | null = null

  for (let i = 0; i < guards.length; i++) {
    const r = guards[i](router.currentRoute)
    if (r) {
      // Some guard activated
      activatedGuardRoute = r
      break
    }
  }
  if (activatedGuardRoute) {
    router.push(activatedGuardRoute)
  }
}

