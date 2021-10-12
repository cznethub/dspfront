import VueRouter from 'vue-router'
import { routes } from './routes'

export const router = new VueRouter({
  mode: 'history',
  routes
})