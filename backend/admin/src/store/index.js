import Vue from "vue";
import Vuex from "vuex";
import axios from "axios";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    // login
    isLoggedIn: false,
    isAdministrator: false,
    myUsername: null,

    myToken: null,
    myUserData: null,

    // global notification
    globalSnackbarMessage: "",
    isGlobalSnackbarShown: false,
  },
  mutations: {
    // login
    setIsLoggedIn(state, value) {
      state.isLoggedIn = value;
    },
    setIsAdministrator(state, value) {
      state.isAdministrator = value;
    },
    setMyUsername(state, username) {
      state.myUsername = username;
    },
    setMyToken(state, token) {
      state.myToken = token;
    },
    myUserData(state, userData) {
      state.myUserData = userData;
    },

    // global notification
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

    async updateLoginStatus(context) {
      const gAuth = this._vm.$gAuth;
      const gUser = gAuth.GoogleAuth.currentUser.get();

      if (gAuth.isAuthorized) {
        context.commit("setMyToken", gUser.getAuthResponse().id_token);
        console.log("myToken: " + context.state.myToken);

        const userData = await axios.get("/administrators/me");
        console.log(userData);

        const email = gUser.getBasicProfile().getEmail();

        context.commit("setIsLoggedIn", true);
        context.commit("setMyUsername", email);
        context.commit("setMyToken", null);
      } else {
        context.commit("setIsLoggedIn", false);
        context.commit("setIsAdministrator", false);
        context.commit("setMyUsername", null);
        context.commit("setMyToken", null);
      }
    },
  },
  modules: {},
});
