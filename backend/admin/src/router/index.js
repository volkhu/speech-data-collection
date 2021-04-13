import Vue from "vue";
import VueRouter from "vue-router";
import Home from "../views/Home.vue";
import store from "../store";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/login",
    name: "Login",
    component: () => import("../views/Login.vue"),
  },
  {
    path: "/projects",
    name: "Projects",
    component: () => import("../views/Projects.vue"),
  },
  {
    path: "/projects/:projectId",
    name: "Project Details",
    props: true,
    component: () => import("../views/ProjectDetails.vue"),
  },
  {
    path: "/accounts",
    name: "Accounts",
    component: () => import("../views/Accounts.vue"),
  },
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});

// make sure that store init promise has been resolved,
// and data such as login status will be loaded before any navigation will occur
const storeInitApp = store.dispatch("initApp");
router.beforeEach(async (to, from, next) => {
  try {
    await storeInitApp;
  } catch (error) {
    console.log("storeInitApp error: " + error);
  }

  next();
});

// navigation guards
router.beforeEach((to, from, next) => {
  if (store.getters.isLoggedIn) {
    // logged in, redirect to home if on login
    if (to.name === "Login") {
      next({ name: "Home" });
      return;
    }

    // logged in, but no access granted, redirect to home if not already there
    if (to.name !== "Home" && !store.state.myAccountData.has_admin_access) {
      next({ name: "Home" });
      return;
    }

    // redirect to home if on account management and not superuser
    if (to.name === "Accounts" && !store.state.myAccountData.is_superuser) {
      next({ name: "Home" });
      return;
    }
  } else {
    // not logged in, redirect to login if not already there
    if (to.name !== "Login") {
      next({ name: "Login" });
      return;
    }
  }

  next();
});

export default router;
