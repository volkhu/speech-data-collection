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
  clientId:
    "286927702746-a7t53zmiqkk4e4xmewumxfzgkbdpb6ad.apps.googleusercontent.com",
  scope: "email",
  prompt: "select_account",
  fetch_basic_profile: false,
};
Vue.use(GAuth, gauthOption);

// Axios request interceptor to include tokens with HTTP(S) requests
axios.interceptors.request.use((req) => {
  req.headers.Authorization = store.state.myAccountToken;
  console.log(store.state.myAccountToken);
  return req;
});
axios.defaults.baseURL = process.env.VUE_APP_ENDPOINT_BASE_URL;
// maybe update login status if an unauthorized response were to be sent
/*axios.interceptors.response.use((res) => res, (err) => {
  if (err.response.status == 401) {

  }
});*/

new Vue({
  router,
  store,
  vuetify,
  render: (h) => h(App),
}).$mount("#app");
