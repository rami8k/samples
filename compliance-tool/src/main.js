// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import VueApollo from 'vue-apollo'
import createApolloClient from '../src/api/create-apollo-client.js'

import Tabs from 'vue-tabs-component';
import Vuetiful from 'vuetiful/src/main'
import Collapse from 'vue-collapse'
import VueCollapse from 'vue2-collapse'
import VTooltip from 'v-tooltip'

Vue.use(VueApollo);
Vue.use(Tabs);
Vue.use(Vuetiful)
Vue.use(Collapse)
Vue.use(VueCollapse)
Vue.use(VTooltip)

const apolloClient = createApolloClient()

// create apollo instance
const apolloProvider = new VueApollo({
  defaultClient: apolloClient
})

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>',
  provide: apolloProvider.provide()
})
