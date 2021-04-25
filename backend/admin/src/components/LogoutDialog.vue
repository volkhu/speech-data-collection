<template>
  <div>
    <v-dialog max-width="512px" :value="isShown" @input="setIsShown($event)">
      <v-card>
        <v-card-title>Are you sure you want to log out?</v-card-title>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="setIsShown(false)">Cancel</v-btn>
          <v-btn text @click="logout" color="primary">Confirm</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { mapActions } from "vuex";

export default {
  props: ["isShown"],

  methods: {
    ...mapActions(["showGlobalSnackbar"]),

    setIsShown(value) {
      this.$emit("update:isShown", value);
    },

    async logout() {
      try {
        await this.$gAuth.signOut();
        await this.$store.dispatch("updateLoginStatus");

        this.setIsShown(false);
        this.$router.replace({ name: "Login" });

        this.showGlobalSnackbar("You are now logged out.");
      } catch (error) {
        this.showGlobalSnackbar(`Cannot log out. ${error}`);
      }
    },
  },
};
</script>

<style></style>
