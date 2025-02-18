import type { UserModule } from './types'
import { ViteSSG } from 'vite-ssg'
import App from './App.vue'

import { routes } from './routes'
import './assets/css/global.scss'

// https://github.com/antfu/vite-ssg
export const createApp = ViteSSG(
  App,
  {
    routes,
    scrollBehavior(_to, _from, _savedPosition) {
      document.getElementById('app')?.scrollTo({ left: 0, top: 0 })
    },
    base: import.meta.env.BASE_URL,
  },
  (ctx) => {
    // install all modules under `modules/`
    Object.values(import.meta.glob<{ install: UserModule }>('./modules/*.ts', { eager: true }))
      .forEach(i => i.install?.(ctx))
  },
)
