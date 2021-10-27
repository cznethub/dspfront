import '@jsonforms/vue2-vanilla/vanilla.css';
import 'vue-material/dist/vue-material.min.css'
// import 'buefy/dist/buefy.css'
import '@/assets/css/global.scss'
// import 'vue-material/dist/theme/default.css'

import Vuex from 'vuex'
import VuexORM from '@vuex-orm/core'
import datePlugin from 'vuex-orm-plugin-date-attribute'
import createPersistedState from 'vuex-persistedstate'
import VueCookies from 'vue-cookies'
import VueCompositionAPI from '@vue/composition-api'
import Buefy from 'buefy'
import VueRouter from 'vue-router'
import Vue from 'vue'
import App from './App.vue'

import { router } from './router'
import { orm } from '@/models/orm'
import { persistedPaths } from './models/persistedPaths'
import { APP_NAME } from './constants'

import { 
  MdButton,
  MdContent,
  MdTabs,
  MdToolbar,
  MdApp,
  MdIcon,
  MdCard,
  MdDialog,
} from 'vue-material/dist/components'

/** Material modules */
Vue.use(MdButton)
Vue.use(MdContent)
Vue.use(MdTabs)
Vue.use(MdToolbar)
Vue.use(MdApp)
Vue.use(MdIcon)
Vue.use(MdCard)
Vue.use(MdDialog)

VuexORM.use(datePlugin)
Vue.config.productionTip = false
Vue.use(Vuex)

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

Vue.use(VueCompositionAPI)
Vue.use(VueRouter)
Vue.use(VueCookies)
Vue.use(Buefy, {
  defaultIconPack: 'fas',
  defaultContainerElement: '#content',
  defaultNotificationPosition: 'is-top',
  defaultNotificationDuration: 10000,
  defaultNoticeQueue: false,
})

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app')