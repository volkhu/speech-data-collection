import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import vuetify from "./plugins/vuetify";

Vue.config.productionTip = false;

import GAuth from "vue-google-oauth2";
const gauthOption = {
  clientId:
    "286927702746-a7t53zmiqkk4e4xmewumxfzgkbdpb6ad.apps.googleusercontent.com",
  scope: "email",
  prompt: "select_account",
  fetch_basic_profile: false,
};
Vue.use(GAuth, gauthOption);

new Vue({
  router,
  store,
  vuetify,
  render: (h) => h(App),
}).$mount("#app");
