<template>
  <v-container fluid fill-height>
    <v-row>
      <v-spacer></v-spacer>
      <v-col align="center">
        <v-card>
          <v-card-title>Login</v-card-title>
          <v-card-subtitle align="left"
            >Please choose your login method.</v-card-subtitle
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
export default {
  methods: {
    async loginWithGoogle() {
      console.log("loginWithGoogle");
      //const authCode = await this.$gAuth.getAuthCode();
      //console.log(authCode);

      try {
        const googleUser = await this.$gAuth.signIn();
        if (!googleUser) {
          return null;
        }

        this.$store.commit("setLoggedIn");
        this.$router.replace({ name: "Home" });
      } catch (error) {
        //on fail do something
        console.error(error);
        return null;
      }
    },
  },
};
</script>

<style></style>
