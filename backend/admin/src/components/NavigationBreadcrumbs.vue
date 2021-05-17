<template>
  <v-card>
    <v-breadcrumbs :items="breadcrumbsItems">
      <template v-slot:divider>
        <v-icon>mdi-chevron-right</v-icon>
      </template>
    </v-breadcrumbs>
  </v-card>
</template>

<script>
export default {
  computed: {
    /**
     * Construct a hierarchical navigation list of the current page and its parents.
     */
    breadcrumbsItems() {
      // base list, always visible
      let crumbsList = [
        {
          text: "Admin Dashboard",
        },
      ];

      // routes can specify additional items
      const extraBreadcrumbs = this.$route.meta.extraBreadcrumbs;
      if (extraBreadcrumbs) {
        crumbsList = [...crumbsList, ...extraBreadcrumbs];
      }

      // finally add the current page
      crumbsList = [
        ...crumbsList,
        {
          text: this.$route.name,
          exact: true,
          to: { name: this.$route.name },
        },
      ];

      return crumbsList;
    },
  },
};
</script>

<style></style>
