<template>
  <v-row>
    <v-col>
      <v-card>
        <v-row no-gutters>
          <v-col><v-card-title>Projects</v-card-title></v-col>
          <v-spacer></v-spacer>
          <v-col cols="auto">
            <v-text-field
              single-line
              append-icon="mdi-magnify"
              label="Search"
              v-model="searchQuery"
            ></v-text-field>
          </v-col>
          <v-col cols="auto"
            ><v-card-title
              ><v-btn color="primary">
                NEW PROJECT
              </v-btn></v-card-title
            ></v-col
          >
        </v-row>
        <v-data-table
          :headers="tableHeaders"
          :items="projects"
          :search="searchQuery"
          v-bind:loading="tableLoading"
        >
          <template v-slot:item.active="{ item }">
            <v-simple-checkbox
              v-model="item.active"
              disabled
            ></v-simple-checkbox>
          </template>
          <template v-slot:item.actions="{ item }">
            <v-icon small class="mr-2">
              mdi-arrow
            </v-icon>
          </template>
        </v-data-table>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
const axios = require("axios");
const dateFns = require("date-fns");

export default {
  data: () => ({
    tableLoading: "",
    searchQuery: "",
    tableHeaders: [
      { text: "ID", value: "project_id", width: "4%" },
      { text: "Name", value: "name", align: "start" },
      { text: "Description", value: "description", width: "40%" },
      { text: "Creation Date", value: "created_at" },
      { text: "Active", value: "active" },
      { text: "Prompts", value: "prompts" },
      { text: "Recordings", value: "recordings" },
      { text: "Actions", value: "actions", sortable: false },
    ],
    projects: [],
  }),

  mounted() {
    axios
      .get("http://localhost:5000/api/projects")
      .then((response) => {
        this.projects = response.data.map((item) => {
          return {
            ...item,
            created_at: dateFns.format(
              dateFns.parseJSON(item.created_at),
              "dd.MM.yyyy hh:mm"
            ),
            prompts: 0,
            recordings: 0,
          };
        });
        this.tableLoading = false;
      })
      .catch((error) => {
        console.log(error);
      });
  },
};
</script>
