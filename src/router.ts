import { routes } from './routes'
import { EnumRepositoryKeys } from './components/submissions/types'
import VueRouter, { RawLocation } from 'vue-router'
import User from './models/user.model'
import HydroShare from './models/hydroshare.model'
import Repository from './models/repository.model'
import Zenodo from './models/zenodo.model'

export const router = new VueRouter({
  mode: 'history',
  routes,
  scrollBehavior(to, from, savedPosition) {
    document.getElementsByClassName('md-app-container')[0]?.scrollTo({ left: 0, top: 0});
  }
})

const guards: ((to, from?) => RawLocation | null)[] = [
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
  (to, from?): RawLocation | null => {
    if (to.meta?.hasLoggedInGuard && !User.$state.isLoggedIn) {
      return { name: 'login', query: { next: to.path } }
    }

    return null
  },
  // hasAccessTokenGuard
  (to, from?): RawLocation | null => {
    if (to.meta?.hasAccessTokenGuard) {
      let activeRepository: typeof Repository | null = null
      const key = to.params.repository

      switch (key) {
        case EnumRepositoryKeys.hydroshare: activeRepository = HydroShare; break;
        case EnumRepositoryKeys.zenodo: activeRepository = Zenodo; break;
        default: activeRepository = HydroShare
      }

      if (!(activeRepository?.$state.accessToken)) {
        return { path: '/authorize', query: { next: to.path }}
      }
    }

    return null
  }
]

/** Guards are executed in the order they are created */
export function setupRouteGuards() {
  router.beforeEach((to, from, next) => {
    console.log("Router beforeEach: ", to)
    next()
  })

  guards.map((fn: (to, from?) => RawLocation | null) => {
    router.beforeEach((to, from, next) => {
      const activatedRouteGuard = fn(to, from)
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
      activatedGuardRoute = r
      break
    }
  }
  if (activatedGuardRoute) {
    router.push(activatedGuardRoute as RawLocation)
  }
}

