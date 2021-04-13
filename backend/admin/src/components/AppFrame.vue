<template>
  <v-container fluid>
    <!-- Top app bar with title and hamburger menu button -->
    <v-app-bar app color="primary" dark dense clipped-left>
      <v-app-bar-nav-icon @click="toggleNavigationDrawer"></v-app-bar-nav-icon>
      <v-toolbar-title>Admin Dashboard</v-toolbar-title>
      <v-spacer></v-spacer>
    </v-app-bar>

    <!-- Main navigation menu -->
    <v-navigation-drawer app clipped width="325" v-model="showNavigationDrawer">
      <v-list dense nav>
        <!-- Home -->
        <v-list-item link to="/" v-if="myAccountData">
          <v-list-item-icon>
            <v-icon>mdi-home</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>Home</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <!-- Projects -->
        <v-list-item
          link
          to="/projects"
          v-if="myAccountData && myAccountData.has_admin_access"
        >
          <v-list-item-icon>
            <v-icon>mdi-format-list-bulleted</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>Projects</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <!-- Users -->
        <v-list-item
          link
          to="/accounts"
          v-if="myAccountData && myAccountData.is_superuser"
        >
          <v-list-item-icon>
            <v-icon>mdi-account-supervisor</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>Accounts</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <!-- Login -->
        <v-list-item link to="/login" v-if="!myAccountData">
          <v-list-item-icon>
            <v-icon>mdi-login</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>Login</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <!-- Logout -->
        <v-list-item link @click="showLogoutDialog = true" v-if="myAccountData">
          <v-list-item-icon>
            <v-icon>mdi-logout</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title
              >Logout, {{ myAccountData.email }}</v-list-item-title
            >
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <LogoutDialog v-bind:isShown.sync="showLogoutDialog" />

    <!-- Main app content -->
    <v-main>
      <!-- Use full path of the route as a key to reload components if they route to themselves -->
      <router-view :key="$route.fullPath"></router-view>
    </v-main>
  </v-container>
</template>

<script>
import { mapState } from "vuex";
import LogoutDialog from "./LogoutDialog";

export default {
  components: {
    LogoutDialog,
  },

  computed: {
    ...mapState(["myAccountData"]),
  },

  methods: {
    toggleNavigationDrawer() {
      this.showNavigationDrawer = !this.showNavigationDrawer;
    },
  },

  data: () => ({
    showNavigationDrawer: true,
    showLogoutDialog: false,
  }),
};
</script>

<style></style>
