import '@jsonforms/vue2-vanilla/vanilla.css';
import Vuex from 'vuex'
import VuexORM from '@vuex-orm/core'
import datePlugin from 'vuex-orm-plugin-date-attribute'
import createPersistedState from 'vuex-persistedstate'

// import App from './App.vue'
// import VueUploadComponent from 'vue-upload-component'
// import { createApp } from 'vue'

// const app = createApp(App)
// app.mount('#app')
// app.component('file-upload', VueUploadComponent)


import 'buefy/dist/buefy.css'
import '@/assets/css/global.scss'
import VueCompositionAPI from '@vue/composition-api'
import Buefy from 'buefy'
import VueRouter from 'vue-router'
import Vue from 'vue'
import App from './App.vue'
import { routes } from './routes'
import { orm } from '@/models/orm'
import { persistedPaths } from './models/persistedPaths';
import { APP_NAME } from './constants';

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

Vue.use(Buefy, {
  defaultIconPack: 'fas',
  // defaultContainerElement: '#content',
  defaultNotificationPosition: 'is-top',
  defaultNotificationDuration: 10000,
  defaultNoticeQueue: false,
})

Vue.use(VueCompositionAPI)

const router = new VueRouter({
  mode: 'history',
  routes
})

Vue.use(VueRouter)

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app')