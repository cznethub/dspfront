import VueRouter from 'vue-router'
import User from './models/user.model'

import { routes } from './routes'

export const router = new VueRouter({
  mode: 'history',
  routes
})

router.beforeEach((to, from, next) => {
  if (to.meta?.hasLoggedInGuard && !User.isLoggedIn) {
    next({ path: '/login'})
  }
  else {
    next()
  }
})