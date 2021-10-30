import { routes } from './routes'
import { EnumRepositoryKeys } from './components/submissions/types'
import VueRouter from 'vue-router'
import HydroShare from './models/hydroshare.model'
import Repository from './models/repository.model'
import User from './models/user.model'
import Zenodo from './models/zenodo.model'

export const router = new VueRouter({
  mode: 'history',
  routes
})

/** Guards are executed in the order they are created */
export function setupRouteGuards() {
  router.beforeEach((to, from, next) => {
    console.log("Router beforeEach: ", to)
    next()
  })

  // Next route redirects
  router.beforeEach((to, from, next) => {
    const nextRoute = User.$state.next
    if (nextRoute) {
      // Consume the redirect
      User.commit((state) => {
        state.next = ''
      })
      next({ path: nextRoute })
    }
    else {
      next()
    }
  })

  // hasLoggedInGuard
  router.beforeEach((to, from, next) => {
    if (to.meta?.hasLoggedInGuard && !User.$state.isLoggedIn) {
      next({ path: '/login', query: { next: to.path } })
    }
    else {
      next()
    }
  })

  // hasAccessTokenGuard
  router.beforeEach((to, from, next) => {
    if (to.meta?.hasAccessTokenGuard) {
      let activeRepository: typeof Repository | null = null
      let key = to.params.repository

      switch (key) {
        case EnumRepositoryKeys.hydroShare: activeRepository = HydroShare; break;
        case EnumRepositoryKeys.zenodo: activeRepository = Zenodo; break;
      }

      console.log(activeRepository?.$state)

      if (!(activeRepository?.$state.accessToken)) {
        next({ path: '/authorize', query: { next: to.path }})
      }
      else {
        next()
      }
    }
    else {
      next()
    }
  })

  checkNextOnce() // Check if a redirect was set
}

/** Call this manually immediately after guards are setup to perform a pending redirect.
 * Useful if the guards were being setup when the redirect was needed. 
 * */
function checkNextOnce() {
  const nextRoute = User.$state.next
  if (nextRoute) {
    // Consume the redirect
    User.commit((state) => {
      state.next = ''
    })
    router.push({ path: nextRoute })
  }
}
