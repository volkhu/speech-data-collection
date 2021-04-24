<template>
  <v-container fluid>
    <!-- Create new project dialog -->
    <new-edit-project-dialog
      :isShown="isNewEditProjectDialogShown"
      @update:isShown="isNewEditProjectDialogShown = $event"
      v-model="newEditProjectDialogData"
      @projectDetailsSaved="loadProjectsTableItems"
    />

    <v-row>
      <v-col>
        <v-card>
          <v-card-title
            >Projects
            <v-spacer></v-spacer>
            <v-text-field
              single-line
              append-icon="mdi-magnify"
              label="Search projects"
              v-model="projectsTableSearchQuery"
              class="shrink mr-1 mt-2"
            ></v-text-field>
            <v-btn icon class="mr-2" @click="loadProjectsTableItems"
              ><v-icon>mdi-refresh</v-icon></v-btn
            >
            <v-btn color="primary" @click="openNewProjectDialog">
              NEW PROJECT
            </v-btn>
          </v-card-title>
          <v-data-table
            :items-per-page="projectsTableItemsPerPage"
            :headers="projectsTableHeaders"
            :items="projectsTableItems"
            :search="projectsTableSearchQuery"
            :loading="isProjectsTableLoading"
          >
            <template v-slot:item.created_at="{ item }">
              {{ formatDateTime(item.created_at) }}<br />({{ item.created_by }})
            </template>
            <template v-slot:item.last_edited_at="{ item }">
              {{ formatDateTime(item.last_edited_at) }}<br />({{
                item.last_edited_by
              }})
            </template>
            <template v-slot:item.active="{ item }">
              <v-simple-checkbox
                :value="item.active"
                disabled
              ></v-simple-checkbox>
            </template>
            <template v-slot:item.actions="{ item }">
              <v-btn icon @click="openEditProjectDetailsDialog(item)">
                <v-icon>mdi-pencil</v-icon>
              </v-btn>
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
import { mapActions } from "vuex";
import datetime from "@/mixins/datetime";
import NewEditProjectDialog from "@/components/projects/NewEditProjectDialog";

export default {
  data: () => ({
    isProjectsTableLoading: true,
    projectsTableSearchQuery: "",
    projectsTableHeaders: [
      { text: "ID", value: "project_id" },
      { text: "Name", value: "name" },
      { text: "Description", value: "description", width: "40%" },
      { text: "Created", value: "created_at" },
      { text: "Edited", value: "last_edited_at" },
      { text: "Active", value: "active" },
      { text: "Prompts", value: "num_prompts" },
      { text: "Recordings", value: "num_recordings" },
      {
        text: "Actions",
        value: "actions",
        sortable: false,
        align: "center",
        width: "10%",
      },
    ],
    projectsTableItems: [],
    projectsTableItemsPerPage: 15,

    isNewEditProjectDialogShown: false,
    newEditProjectDialogData: {},
  }),

  components: {
    NewEditProjectDialog,
  },

  methods: {
    ...mapActions(["showGlobalSnackbar"]),

    openNewProjectDialog() {
      this.newEditProjectDialogData = {};
      this.isNewEditProjectDialogShown = true;
    },

    openEditProjectDetailsDialog(item) {
      this.newEditProjectDialogData = JSON.parse(JSON.stringify(item));

      this.isNewEditProjectDialogShown = true;
    },

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
