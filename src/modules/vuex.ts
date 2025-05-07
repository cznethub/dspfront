import type { UserModule } from '~/types'
import VuexORM from '@vuex-orm/core'
import { createStore } from 'vuex'
import createPersistedState from 'vuex-persistedstate'
import { orm } from '~/models/orm'
import { persistedPaths } from '~/models/persistedPaths'

// Create Vuex Store and register database through Vuex ORM.
export const store = createStore({
  plugins: [
    VuexORM.install(orm),
    createPersistedState({
      paths: persistedPaths,
      key: `CZ Hub`,
    }),
  ],
  // state() {
  //   return {
  //     count: 0,
  //   }
  // },
  // mutations: {
  //   increment(state) {
  //     state.count++
  //   },
  // },
})

// Setup Pinia
// https://pinia.vuejs.org/
export const install: UserModule = ({ app }) => {
  // Install the store instance as a plugin
  app.use(store)
}
