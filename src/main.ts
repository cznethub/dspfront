import '@jsonforms/vue2-vanilla/vanilla.css';

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

Vue.config.productionTip = false

Vue.use(Buefy, {
    defaultIconPack: 'fas',
    // defaultContainerElement: '#content',
    defaultNotificationPosition: 'is-top',
    defaultNotificationDuration: 10000,
    defaultNoticeQueue: false,
})

Vue.use(VueCompositionAPI)

const router = new VueRouter({
    routes
})

Vue.use(VueRouter)

new Vue({
    router,
    render: (h) => h(App),
}).$mount('#app')