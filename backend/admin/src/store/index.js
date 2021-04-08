import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    isAuthorized: false,
  },
  mutations: {
    setLoggedIn(state) {
      state.isAuthorized = true;
    },
    setLoggedOut(state) {
      state.isAuthorized = false;
    },
  },
  actions: {},
  modules: {},
});
