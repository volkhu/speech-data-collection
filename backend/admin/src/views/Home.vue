<template>
  <v-container>
    <v-row>
      <v-col>
        <v-card>
          <!-- Welcome for new unconfirmed users -->
          <div v-if="myAccountData && !myAccountData.has_admin_access">
            <v-card-title
              ><v-icon class="mr-2">mdi-timer-sand-empty</v-icon>Please
              wait</v-card-title
            >
            <v-card-text
              >While you have successfully signed up for the Speech App Admin
              Dashboard, an administrator has not yet granted you access.
            </v-card-text>
          </div>

          <!-- Welcome for users with admin access -->
          <div v-if="myAccountData && myAccountData.has_admin_access">
            <v-card-title>Welcome</v-card-title>
            <v-card-text
              >This is the Speech App Admin Dashboard. Here you can manage
              projects, prompts and other properties of the Speech Data
              Collection app, including downloading of the recorded prompts. See
              the menu on the left for more options.</v-card-text
            >
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapState, mapActions } from "vuex";

export default {
  name: "Home",
  components: {},

  computed: {
    ...mapState(["myAccountData"]),
  },

  data: () => ({
    refreshAccountStatusTimer: null,
  }),

  methods: {
    ...mapActions(["updateLoginStatus"]),
  },

  created() {
    // poll for changes in account status if waiting for access
    if (this.myAccountData && !this.myAccountData.has_admin_access) {
      this.refreshAccountStatusTimer = setInterval(() => {
        this.updateLoginStatus().then(() => {
          if (this.myAccountData && this.myAccountData.has_admin_access) {
            clearInterval(this.refreshAccountStatusTimer);
          }
        });
      }, 10000);
    }
  },

  beforeDestroy() {
    clearInterval(this.refreshAccountStatusTimer);
  },
};
</script>
