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
  MdSnackbar,
  MdField,
  MdMenu,
  MdList,
  MdTable,
  MdRipple,
  MdCheckbox,
  MdChips,
  MdDatepicker,
  MdSpeedDial,
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
Vue.use(MdSnackbar)
Vue.use(MdField)
Vue.use(MdMenu)
Vue.use(MdList)
Vue.use(MdTable)
Vue.use(MdRipple)
Vue.use(MdCheckbox)
Vue.use(MdChips)
Vue.use(MdDatepicker)
Vue.use(MdSpeedDial)

// https://github.com/vuematerial/vue-material/issues/2285
Vue.config.errorHandler = (err, vm, info) => {
  if (process.env.NODE_ENV !== 'production') {
    // Show any error but this one
    if (err.message !== "Cannot read properties of undefined (reading 'badInput')") {
      console.error(err)
    }
  }
}

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