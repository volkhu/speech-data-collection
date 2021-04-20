import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import vuetify from "./plugins/vuetify";
import axios from "axios";

Vue.config.productionTip = false;

// Google auth API
import GAuth from "vue-google-oauth2";
const gauthOption = {
  clientId: process.env.VUE_APP_GOOGLE_CLIENT_ID,
  scope: "email",
  prompt: "select_account",
  fetch_basic_profile: false,
};
Vue.use(GAuth, gauthOption);

var vm = new Vue({
  router,
  store,
  vuetify,
  render: (h) => h(App),
}).$mount("#app");

// axios request interceptor to include tokens with HTTP(S) requests
axios.interceptors.request.use((req) => {
  const gAuth = vm.$gAuth;

  if (gAuth.isInit && gAuth.isAuthorized) {
    req.headers.Authorization = gAuth.GoogleAuth.currentUser
      .get()
      .getAuthResponse().id_token;
  }

  return req;
});
axios.defaults.baseURL = process.env.VUE_APP_ENDPOINT_BASE_URL;
