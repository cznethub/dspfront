import '@jsonforms/vue-vanilla/vanilla.css';

import App from './App.vue'
import VueUploadComponent from 'vue-upload-component'
import { createApp } from 'vue'

const app = createApp(App)
app.mount('#app')
app.component('file-upload',VueUploadComponent)