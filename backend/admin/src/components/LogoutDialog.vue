<template>
  <div>
    <v-dialog
      max-width="512px"
      :value="isShown"
      @input="$emit('update:isShown', $event)"
    >
      <v-card>
        <v-card-title>Are you sure you want to log out?</v-card-title>
        <v-card-actions>
          <v-container>
            <v-row
              ><v-col align="right">
                <v-btn text @click="closeDialog">Cancel</v-btn>
                <v-btn text @click="logout">Confirm</v-btn>
              </v-col></v-row
            >
          </v-container>
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

    closeDialog() {
      this.$emit("update:isShown", false);
    },

    logout() {
      this.$gAuth.signOut().then(() => {
        this.closeDialog();

        this.$store.dispatch("updateLoginStatus");
        this.$router.replace({ name: "Login" });

        this.showGlobalSnackbar("You are now logged out.");
      });
    },
  },
};
</script>

<style></style>
