import Vue from "vue";
import Vuex from "vuex";
import axios from "axios";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    // login
    myAccountToken: null,
    myAccountData: null,

    // global notification
    globalSnackbarMessage: "",
    isGlobalSnackbarShown: false,
  },
  mutations: {
    // login
    setMyAccountToken(state, accountToken) {
      state.myAccountToken = accountToken;
    },
    setMyAccountData(state, accountData) {
      state.myAccountData = accountData;
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
      try {
        const gAuth = this._vm.$gAuth;
        const gUser = gAuth.GoogleAuth.currentUser.get();

        if (gAuth.isAuthorized) {
          // logged in, get google ID token
          context.commit("setMyAccountToken", gUser.getAuthResponse().id_token);

          // get info about my account from endpoint
          const accountDataResponse = await axios.get("/accounts/me");
          context.commit("setMyAccountData", accountDataResponse.data);
        } else {
          // logged out, reset fields
          context.commit("setMyAccountToken", null);
          context.commit("setMyAccountData", null);
        }
      } catch (error) {
        console.log("updateLoginStatus error: " + error);
      }
    },
  },
  modules: {},
});
