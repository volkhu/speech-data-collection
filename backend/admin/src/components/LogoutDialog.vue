<template>
  <div>
    <v-dialog max-width="512px" :value="isShown" @input="setIsShown($event)">
      <v-card>
        <v-card-title>Are you sure you want to log out?</v-card-title>
        <v-card-actions>
          <v-container>
            <v-row
              ><v-col align="right">
                <v-btn text @click="setIsShown(false)">Cancel</v-btn>
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
