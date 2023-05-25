import '@jsonforms/vue-vanilla/vanilla.css';
import '@/assets/css/global.scss'

import Vuex from 'vuex'
import VuexORM from '@vuex-orm/core'
import createPersistedState from 'vuex-persistedstate'
import VueCookies from 'vue-cookies'
import Buefy from '@dword-design/buefy'
import { router } from './router'
// import Vue from 'vue'
import { createApp } from 'vue'
import App from './App.vue'
import vuetify from '@/plugins/vuetify'
// import browserDetect from "vue-browser-detect-plugin"
// import IdleVue from 'idle-vue'

import { orm } from '@/models/orm'
import { persistedPaths } from './models/persistedPaths'
import { APP_NAME } from './constants'

// Uncomment to filter out errors
// Vue.config.errorHandler = (err, vm, info) => {
  //   if (process.env.NODE_ENV !== 'production') {
    //     // Show any error but this one
    //     if (err.message !== "Some error you want to leave out") {
      //       console.error(err)
      //     }
      //   }
      // }
const app = createApp(App)
// app.config.productionTip = false

app.use(router)

app.use(vuetify)

// Create Vuex Store and register database through Vuex ORM.
const store = new Vuex.Store({
  plugins: [
    VuexORM.install(orm),
    createPersistedState({
      paths: persistedPaths,
      key: APP_NAME
    })
  ]
})
app.use(store)

app.use(router)
app.use(VueCookies)
// TODO: fix browserDetect
// app.use(browserDetect)
app.use(Buefy, {
  defaultIconPack: 'fas',
  defaultContainerElement: '#content',
  defaultNotificationPosition: 'is-top',
  defaultNotificationDuration: 10000,
  defaultNoticeQueue: false,
})

// new Vue({
//   router,
//   // store,
//   vuetify,
//   render: (h) => h(App),
// }).$mount('#app')

app.mount('#app')

export default app