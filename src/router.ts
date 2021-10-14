import VueRouter from 'vue-router'
import User from './models/user.model'
import { routes } from './routes'

export const router = new VueRouter({
  mode: 'history',
  routes
})

router.beforeEach((to, from, next) => {
  // Resolve pending redirect (i.e after login)
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

