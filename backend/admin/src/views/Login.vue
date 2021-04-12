<template>
  <v-container fluid fill-height>
    <v-row>
      <v-spacer></v-spacer>
      <v-col align="center">
        <v-card>
          <v-card-title>Login</v-card-title>
          <v-card-subtitle align="left"
            >Please select your preferred login method.</v-card-subtitle
          >
          <v-card-text>
            <button @click="loginWithGoogle">
              <img
                src="../assets/google/btn_google_signin_dark_normal_web.png"
              />
            </button>
          </v-card-text>
        </v-card>
      </v-col>
      <v-spacer></v-spacer>
    </v-row>
  </v-container>
</template>

<script>
import { mapActions, mapState } from "vuex";

export default {
  data: () => ({
    loginSuccessSnackbarShown: false,
  }),

  computed: {
    ...mapState(["myAccountData"]),
  },

  methods: {
    ...mapActions(["showGlobalSnackbar"]),

    async loginWithGoogle() {
      try {
        const gUser = await this.$gAuth.signIn();

        if (gUser) {
          await this.$store.dispatch("updateLoginStatus");
          this.$router.replace({ name: "Home" });

          this.showGlobalSnackbar(
            `You are now logged in as ${this.myAccountData.email}.`
          );
        }
      } catch (error) {
        console.error("login error: " + error);
      }
    },
  },
};
</script>

<style></style>
