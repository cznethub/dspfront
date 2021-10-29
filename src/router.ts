import VueRouter from 'vue-router'
import { EnumRepositoryKeys } from './components/submissions/types'
import HydroShare from './models/hydroshare.model'
import Repository from './models/repository.model'
import User from './models/user.model'
import Zenodo from './models/zenodo.model'
import { routes } from './routes'

export const router = new VueRouter({
  mode: 'history',
  routes
})

export function setupRouteGuards() {
  router.beforeEach((to, from, next) => {
    console.log("Router beforeEach: ", to)
    const nextRoute = User.$state.next
    if (nextRoute) {
      // Consume the redirect
      User.commit((state) => {
        state.next = ''
      })
      next({ path: nextRoute })
    }
    else if (to.meta?.hasLoggedInGuard && !User.$state.isLoggedIn) {
      next({ path: '/login', query: { next: to.path } })
    }
    else if (to.meta?.hasAccessTokenGuard) {
      let activeRepository: typeof Repository | null = null
      let key = to.params.repository

      switch (key) {
        case EnumRepositoryKeys.hydroShare: activeRepository = HydroShare; break;
        case EnumRepositoryKeys.zenodo: activeRepository = Zenodo; break;
      }

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
