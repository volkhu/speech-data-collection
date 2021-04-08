<template>
  <v-container fluid>
    <v-row>
      <v-col>
        <v-card>
          <v-row no-gutters>
            <v-col><v-card-title>Users</v-card-title></v-col>
            <v-spacer></v-spacer>
            <v-col cols="auto">
              <v-text-field
                single-line
                append-icon="mdi-magnify"
                label="Search"
                v-model="searchQuery"
              ></v-text-field>
            </v-col>
          </v-row>
          <v-data-table
            :headers="tableHeaders"
            :items="users"
            :search="searchQuery"
            v-bind:loading="tableLoading"
          >
            <template v-slot:item.admin_access="{ item }">
              <v-switch
                v-model="item.admin_access"
                :disabled="!item.modifiable"
              ></v-switch>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
const dateFns = require("date-fns");

export default {
  data: () => ({
    tableLoading: false,
    searchQuery: "",
    tableHeaders: [
      { text: "E-mail", value: "email", align: "start" },
      { text: "Dashboard Admin Access", value: "admin_access" },
      { text: "Last Activity", value: "last_activity" },
    ],
    users: [
      {
        email: "example@gmail.com",
        admin_access: true,
        modifiable: false,
        last_activity: "31.03.2021",
      },
      {
        email: "keegi.teine78@gmail.com",
        admin_access: false,
        modifiable: true,
        last_activity: "29.03.2021",
      },
      {
        email: "test.kasutaja25@gmail.com",
        admin_access: false,
        modifiable: true,
        last_activity: "22.03.2021",
      },
    ],
  }),
};
</script>

<style></style>
