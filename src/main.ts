import { ViteSSG } from 'vite-ssg'
import App from './App.vue'
import type { UserModule } from './types'

import './assets/css/global.scss'
import { routes } from './routes'

// https://github.com/antfu/vite-ssg
export const createApp = ViteSSG(
  App,
  {
    routes,
    scrollBehavior(_to, _from, _savedPosition) {
      document.getElementsByTagName('html')[0]?.scrollTo({ left: 0, top: 0 })
    },
    base: import.meta.env.BASE_URL,
  },
  (ctx) => {
    // install all modules under `modules/`
    Object.values(import.meta.glob<{ install: UserModule }>('./modules/*.ts', { eager: true }))
      .forEach(i => i.install?.(ctx))
  },
)
