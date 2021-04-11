<template>
  <v-app>
    <!-- Loading icon -->
    <AppLoadingIndicator v-if="!isGoogleApiInitialized" />

    <!-- Global frame around the app (title bar, nav bar, etc.) including the app content itself -->
    <AppFrame v-if="isGoogleApiInitialized" />

    <!-- Global snackbar message -->
    <v-snackbar timeout="2000" v-model="isGlobalSnackbarShown">
      {{ globalSnackbarMessage }}
    </v-snackbar>
  </v-app>
</template>

<script>
import { mapState } from "vuex";
import AppLoadingIndicator from "./components/AppLoadingIndicator";
import AppFrame from "./components/AppFrame";

export default {
  name: "App",

  computed: {
    ...mapState(["isGoogleApiInitialized", "globalSnackbarMessage"]),
    isGlobalSnackbarShown: {
      set(value) {
        this.$store.commit("setIsGlobalSnackbarShown", value);
      },
      get() {
        return this.$store.state.isGlobalSnackbarShown;
      },
    },
  },

  components: {
    AppLoadingIndicator,
    AppFrame,
  },

  methods: {
    waitForGoogleApiToLoad() {
      const checkInterval = setInterval(() => {
        if (this.$gAuth.isInit) {
          this.$store.commit("setIsGoogleApiInitialized", true);

          if (this.$gAuth.isAuthorized) {
            this.$store.commit("setIsLoggedIn", true);
            this.$store.commit(
              "setMyUsername",
              this.$gAuth.GoogleAuth.currentUser.get().Qs.zt
            );
          }

          clearInterval(checkInterval);
        }
      }, 100);
    },
  },

  created() {
    this.waitForGoogleApiToLoad();
  },
};
</script>
