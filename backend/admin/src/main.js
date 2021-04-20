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

// axios request interceptor to include tokens with HTTP(S) requests
axios.interceptors.request.use((req) => {
  req.headers.Authorization = store.state.myAccountToken;
  //console.log(store.state.myAccountToken);
  return req;
});
axios.defaults.baseURL = process.env.VUE_APP_ENDPOINT_BASE_URL;
console.log(axios.defaults.baseURL);
// possibly update login status if an unauthorized response were to be sent
/*axios.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response.status == 401) {
      store.dispatch("updateLoginStatus");
    }

    throw err;
  }
);*/

new Vue({
  router,
  store,
  vuetify,
  render: (h) => h(App),
}).$mount("#app");
