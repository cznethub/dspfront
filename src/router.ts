import VueRouter from 'vue-router'
import User from './models/user.model'
import { routes } from './routes'

export const router = new VueRouter({
  mode: 'history',
  routes
})

export function setupRouteGuards() {
  router.beforeEach((to, from, next) => {
    // Resolve pending redirect (i.e after login)
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
    else {
      next()
    }
  })

  checkNextOnce() // Check if a redirect was set
}

/** Call this manually immediately after guards are setup to perform a pending redirect.
 * Useful if the guards were being setup when the redirect was needed. 
 * */
export function checkNextOnce() {
  const nextRoute = User.$state.next
  if (nextRoute) {
    // Consume the redirect
    User.commit((state) => {
      state.next = ''
    })
    router.push({ path: nextRoute })
  }
}
