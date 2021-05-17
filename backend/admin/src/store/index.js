import Vue from "vue";
import Vuex from "vuex";
import axios from "axios";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    // init
    appReady: false,

    // global notification
    globalSnackbarMessage: null,
    isGlobalSnackbarShown: false,

    // login
    myAccountData: null,
  },
  getters: {
    isLoggedIn: (state) => {
      return state.myAccountData != null;
    },
  },
  mutations: {
    // init
    setAppReady(state) {
      state.appReady = true;
    },

    // global notification
    setGlobalSnackbarMessage(state, value) {
      state.globalSnackbarMessage = value;
    },
    setIsGlobalSnackbarShown(state, value) {
      state.isGlobalSnackbarShown = value;
    },

    // login
    setMyAccountData(state, accountData) {
      state.myAccountData = accountData;
    },
  },
  actions: {
    /**
     * Wait for Google API to load and check login status for the first time after
     * initial page load.
     *
     * @returns promise that will be finished when Google API has loaded and initial
     * login status determined
     */
    initApp(context) {
      return new Promise((resolve, reject) => {
        const checkInterval = setInterval(() => {
          if (this._vm.$gAuth.isInit) {
            clearInterval(checkInterval);

            context
              .dispatch("updateLoginStatus")
              .then(() => {
                resolve();
                context.commit("setAppReady");
              })
              .catch((error) => {
                reject();
              });
          }
        }, 100);
      });
    },

    /**
     * Show a global notification with a specified message for a limited time.
     *
     * @param message text to display on the notification
     */
    showGlobalSnackbar(context, message) {
      context.commit("setGlobalSnackbarMessage", message);
      context.commit("setIsGlobalSnackbarShown", true);
    },

    /**
     * Check if user has logged in via their Google account and either
     * fetch their account privileges and other data or log them out.
     */
    async updateLoginStatus(context) {
      try {
        const gAuth = this._vm.$gAuth;

        if (gAuth.isInit && gAuth.isAuthorized) {
          // logged into Google, get info about my account from endpoint
          const accountDataResponse = await axios.get("/accounts/me");
          context.commit("setMyAccountData", accountDataResponse.data);
        } else {
          // logged out, reset account data
          context.commit("setMyAccountData", null);
        }
      } catch (error) {
        context.dispatch("showGlobalSnackbar", `Cannot login. ${error}.`);
      }
    },
  },
  modules: {},
});
