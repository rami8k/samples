// import Vue from 'vue'
import { shallowMount } from '@vue/test-utils'
import TheHeader from '@/components/TheHeader.vue'
import { createLocalVue } from '../setup'

// jest.mock('@/api/auth')

const USER_INFO = 'user-info'
const SERVER_AUTH_TOKEN = 'gdpr-server-auth-token'

describe('TheHeader.vue', () => {
  // it('should render correct contents', () => {
  //   const Constructor = Vue.extend(TheHeader)
  //   const vm = new Constructor().$mount()
  //   expect(vm.$el.querySelector('.banner .header').textContent)
  //     .toEqual('Compliance Tool')
  // })


  const localVue = createLocalVue()

  test('TheHeader.vue when logged out', () => {

    const wrapper = shallowMount(TheHeader, {
      localVue,
      stubs: ['router-link']
    })

    expect(wrapper.find('.user-info').exists()).toBe(false)

    expect(wrapper.vm.$el.querySelector('.banner .header').textContent)
      .toEqual('Compliance Tool')

  })

  test('TheHeader.vue when logged in', () => {

    window.localStorage.setItem(USER_INFO, JSON.stringify({
      firstName: 'first name',
      roles: ['user']
    }))

    window.localStorage.setItem(SERVER_AUTH_TOKEN, 'token')

    const wrapper = shallowMount(TheHeader, {
      localVue,
      stubs: ['router-link']
    })

    expect(wrapper.find('.user-info').exists()).toBe(true)

    expect(wrapper.vm.$el.querySelector('.banner .header').textContent)
      .toEqual('Compliance Tool')

    expect(wrapper.vm.$el.querySelector('.user-name').textContent)
      .toEqual('first name')
  })

  test('TheHeader.vue when logged in as an admin', () => {

    window.localStorage.setItem(USER_INFO, JSON.stringify({
      firstName: 'first name',
      roles: ['admin']
    }))

    window.localStorage.setItem(SERVER_AUTH_TOKEN, 'token')

    const wrapper = shallowMount(TheHeader, {
      localVue,
      stubs: ['router-link']
    })

    expect(wrapper.vm.headerRoute.name).toBe('admin');
  })

  test('TheHeader.vue when logged in as an user', () => {

    window.localStorage.setItem(USER_INFO, JSON.stringify({
      firstName: 'first name',
      roles: ['user']
    }))

    window.localStorage.setItem(SERVER_AUTH_TOKEN, 'token')

    const wrapper = shallowMount(TheHeader, {
      localVue,
      stubs: ['router-link']
    })

    expect(wrapper.vm.headerRoute.name).toBe('home');
  })
})

