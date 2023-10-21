// import Vue from 'vue'
import { createLocalVue as createTestUtilsVue } from '@vue/test-utils'

// Vue.config.productionTip = false


jest.setTimeout(20000)

export function createLocalVue() {
  const localVue = createTestUtilsVue()

  localVue.config.productionTip = false

  return localVue
}