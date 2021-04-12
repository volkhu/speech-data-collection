<template>
  <v-app>
    <!-- Loading icon -->
    <AppLoadingIndicator v-if="!appReady" />

    <!-- Global frame around the app (title bar, nav bar, etc.) including the app content itself -->
    <AppFrame v-if="appReady" />

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
    ...mapState(["globalSnackbarMessage"]),
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

  data: () => ({
    appReady: false,
  }),

  methods: {
    waitForGoogleApiToLoad() {
      const checkInterval = setInterval(() => {
        if (this.$gAuth.isInit) {
          this.$store.dispatch("updateLoginStatus").then(() => {
            this.appReady = true;
          });

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
