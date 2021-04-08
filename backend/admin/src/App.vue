<template>
  <v-app>
    <v-app-bar app color="primary" dark dense clipped-left>
      <v-app-bar-nav-icon
        @click.stop="showNavigationDrawer = !showNavigationDrawer"
      ></v-app-bar-nav-icon>
      <v-toolbar-title>Admin Dashboard</v-toolbar-title>
      <v-spacer></v-spacer>
    </v-app-bar>

    <v-navigation-drawer
      app
      clipped
      v-model="showNavigationDrawer"
      :width="325"
    >
      <v-list dense nav>
        <v-list-item
          link
          v-for="item in navigationDrawerItems"
          :key="item.title"
          :to="item.route"
        >
          <v-list-item-icon>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-spacer></v-spacer>
        <v-list-item link @click="logoutNow" v-if="$store.state.isAuthorized">
          <v-list-item-icon>
            <v-icon>mdi-logout</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>Logout, {{ username }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <!-- Use full path of the route as a key to reload components if they route to themselves -->
      <router-view :key="$route.fullPath"></router-view>
    </v-main>
  </v-app>
</template>

<script>
export default {
  name: "App",

  computed: {
    navigationDrawerItems() {
      return this.$store.state.isAuthorized
        ? this.navigationDrawerItemsLoggedIn
        : this.navigationDrawerItemsLoggedOut;
    },

    username() {
      if (this.$store.state.isAuthorized) {
        return this.$gAuth.GoogleAuth.currentUser.get().Qs.zt;
        //console.log(this.$gAuth.GoogleAuth.currentUser.get());
      }
    },
  },

  data: {
    navBarWidth: 325,
  },

  methods: {
    async logoutNow() {
      try {
        // fix up later
        await this.$gAuth.signOut();
        this.$store.commit("setLoggedOut");
        this.$router.replace({ name: "Login" });
      } catch (error) {
        console.error(error);
      }
    },
  },

  data: () => ({
    disableAppBar: false,
    disableNavigationDrawer: false,
    showNavigationDrawer: true,
    navigationDrawerItemsLoggedIn: [
      {
        title: "Home",
        icon: "mdi-home",
        route: "/",
      },
      {
        title: "Projects",
        icon: "mdi-format-list-bulleted",
        route: "/projects",
      },
      {
        title: "Users",
        icon: "mdi-account-supervisor",
        route: "/users",
      },
    ],
    navigationDrawerItemsLoggedOut: [
      {
        title: "Home",
        icon: "mdi-home",
        route: "/",
      },
      {
        title: "Login",
        icon: "mdi-login",
        route: "/login",
      },
    ],
  }),

  created() {
    // test from docs, remove later
    let that = this;
    let checkGauthLoad = setInterval(function() {
      that.$gAuth.isInit;

      if (that.$gAuth.isInit) {
        if (that.$gAuth.isAuthorized) {
          that.$store.commit("setLoggedIn");
        } else {
          that.$store.commit("setLoggedOut");
        }
      }

      if (that.isInit) clearInterval(checkGauthLoad);
    }, 100);
  },
};
</script>
