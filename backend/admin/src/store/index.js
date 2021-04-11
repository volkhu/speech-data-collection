import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    isGoogleApiInitialized: false,
    isLoggedIn: false,
    isAdministrator: false,
    myUsername: null,

    globalSnackbarMessage: "",
    isGlobalSnackbarShown: false,
  },
  mutations: {
    setIsGoogleApiInitialized(state, value) {
      state.isGoogleApiInitialized = value;
    },

    setIsLoggedIn(state, value) {
      state.isLoggedIn = value;
    },

    setIsAdministrator(state, value) {
      state.isAdministrator = value;
    },

    setMyUsername(state, username) {
      state.myUsername = username;
    },

    setGlobalSnackbarMessage(state, value) {
      state.globalSnackbarMessage = value;
    },

    setIsGlobalSnackbarShown(state, value) {
      state.isGlobalSnackbarShown = value;
    },
  },
  actions: {
    showGlobalSnackbar(context, message) {
      context.commit("setGlobalSnackbarMessage", message);
      context.commit("setIsGlobalSnackbarShown", true);
    },
  },
  modules: {},
});
