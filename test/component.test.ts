import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { createRouter, createWebHistory } from 'vue-router'
import Home from '../src/components/home/cz.home.vue'
import { i18n } from '../src/modules/i18n'
import { vuetify } from '../src/modules/vuetify'
import { store } from '../src/modules/vuex'
import { routes } from '../src/routes'

const router = createRouter({
  history: createWebHistory(),
  routes,
})

const plugins = [router, vuetify, store, i18n]

describe('component Home', () => {
  it('should render', () => {
    const wrapper = mount(Home, {
      props: {},
      global: {
        plugins,
      },
    })
    expect(wrapper.text()).toContain('discoverable')
    // expect(wrapper.html()).toMatchSnapshot()
  })

  it('should be interactive', async () => {
    const wrapper = mount(Home, {
      props: {},
      global: {
        plugins,
      },
    })
    expect(wrapper.text()).toContain('discoverable')

    // expect(wrapper.find('.inc').exists()).toBe(true)

    // expect(wrapper.find('.dec').exists()).toBe(true)

    // await wrapper.get('.inc').trigger('click')

    // expect(wrapper.text()).toContain('1')

    // await wrapper.get('.dec').trigger('click')

    // expect(wrapper.text()).toContain('0')
  })
})
