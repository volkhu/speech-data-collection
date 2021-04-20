<template>
  <v-app>
    <!-- Loading icon -->
    <app-loading-indicator v-if="!appReady" />

    <!-- Global frame around the app (title bar, nav bar, etc.) including the app content itself -->
    <app-frame v-if="appReady" />

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
    ...mapState(["appReady", "globalSnackbarMessage"]),

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
};
</script>
