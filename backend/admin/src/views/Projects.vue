<template>
  <v-container fluid>
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
                label="Search projects"
                v-model="projectsTableSearchQuery"
              ></v-text-field>
            </v-col>
            <v-col cols="auto"
              ><v-card-title
                ><v-btn
                  color="primary"
                  :to="{
                    name: 'Project Details',
                    params: { projectId: 'new' },
                  }"
                >
                  NEW PROJECT
                </v-btn></v-card-title
              ></v-col
            >
          </v-row>
          <v-data-table
            :headers="projectsTableHeaders"
            :items="projectsTableItems"
            :search="projectsTableSearchQuery"
            v-bind:loading="isProjectsTableLoading"
          >
            <template v-slot:item.created_at="{ item }">
              {{ formatDateTime(item.created_at) }}
            </template>
            <template v-slot:item.active="{ item }">
              <v-simple-checkbox
                v-model="item.active"
                disabled
              ></v-simple-checkbox>
            </template>
            <template v-slot:item.view="{ item }">
              <v-btn
                icon
                :to="{
                  name: 'Project Details',
                  params: { projectId: item.project_id },
                }"
              >
                <v-icon>mdi-chevron-right</v-icon>
              </v-btn>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import axios from "axios";
import datetime from "../misc/datetime";

export default {
  data: () => ({
    isProjectsTableLoading: true,
    projectsTableSearchQuery: "",
    projectsTableHeaders: [
      { text: "ID", value: "project_id", width: "4%" },
      { text: "Name", value: "name", align: "start" },
      { text: "Description", value: "description", width: "40%" },
      { text: "Created", value: "created_at" },
      { text: "Active", value: "active" },
      { text: "Prompts", value: "num_prompts" },
      { text: "Recordings", value: "num_recordings" },
      { text: "Details", value: "view", sortable: false, align: "center" },
    ],
    projectsTableItems: [],
  }),

  methods: {
    async loadProjectsTableItems() {
      this.isProjectsTableLoading = true;

      try {
        const projectsResponse = await axios.get("/projects");
        this.projectsTableItems = projectsResponse.data;
      } catch (error) {
        this.showGlobalSnackbar(`Cannot load projects. ${error}`);
      }

      this.isProjectsTableLoading = false;
    },
  },

  mixins: [datetime],

  mounted() {
    this.loadProjectsTableItems();
  },
};
</script>
