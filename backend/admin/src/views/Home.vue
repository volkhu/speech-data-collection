<template>
  <v-container fluid fill-height>
    <v-row>
      <v-spacer></v-spacer>
      <v-col align="center">
        <h2>{{ dashboardMsg }}</h2>
        <br />
        Here you can manage projects, prompts, users and other properties of the
        Speech Data Collection app, including downloading the recorded prompts.
        <br />
        <br />
        <h3>Use the menu on the left to select actions.</h3>
      </v-col>
      <v-spacer></v-spacer>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: "Home",
  components: {},

  computed: {
    dashboardMsg() {
      if (this.$store.state.isAuthorized) {
        return (
          "Welcome to Speech App Admin Dashboard, " +
          this.$gAuth.GoogleAuth.currentUser.get().Qs.zt
        );
        //console.log(this.$gAuth.GoogleAuth.currentUser.get());
      }

      return "Welcome to Speech App Admin Dashboard.";
    },
  },
};
</script>
