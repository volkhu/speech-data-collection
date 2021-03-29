<template>
  <v-app>
    <v-app-bar app color="primary" dark dense clipped-left>
      <v-app-bar-nav-icon
        @click.stop="showNavigationDrawer = !showNavigationDrawer"
      ></v-app-bar-nav-icon>
      <v-toolbar-title>Admin Dashboard</v-toolbar-title>
      <v-spacer></v-spacer>
    </v-app-bar>

    <v-navigation-drawer app clipped v-model="showNavigationDrawer">
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

  data: () => ({
    showNavigationDrawer: true,
    navigationDrawerItems: [
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
  }),
};
</script>
