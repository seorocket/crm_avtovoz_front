import Vue from 'vue'
import Vuex from 'vuex'
import Axios from 'axios'

import router from '../router/index.js'

import createPersistedState from 'vuex-persistedstate'

Vue.prototype.Axios = Axios

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    miniStateDrawer: false,
    orderTabs: [],
    token: undefined
  },
  mutations: {
    turnLeftDrawer (state) {
      state.miniStateDrawer = !state.miniStateDrawer
    },
    addOpenTab (state, data) {
      const arr = [...new Set(state.orderTabs)]
      if (state.orderTabs.indexOf(data) === -1) {
        arr.push(data)
      }
      state.orderTabs = arr
      router.push({ path: '/order/' + data })
    },
    authorize (state, data) {
      state.token = data
    },
    closeTab (state, data) {
      state.orderTabs = state.orderTabs.filter(item => item !== data)
      if (router.currentRoute.path !== '/') {
        router.push({ path: '/' })
      }
    }
  },
  actions: {
    addOpenTab ({ commit }, int) {
      commit('addOpenTab', int)
    },
    closeTab ({ commit }, int) {
      commit('closeTab', int)
    },
    authorize ({ commit }, str) {
      commit('authorize', str)
    }
  },
  modules: {

  },
  plugins: [createPersistedState()]
})
