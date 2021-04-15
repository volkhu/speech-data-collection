<template>
  <v-container fluid>
    <!-- Create new project dialog -->
    <v-dialog max-width="768px" v-model="isNewProjectDialogShown" persistent>
      <v-card>
        <v-card-title>New Project</v-card-title>
        <v-card-subtitle align="left" class="pt-1"
          >Create a new speech data collection project.</v-card-subtitle
        >
        <form @submit.prevent="saveNewProject" :disabled="savingNewProject">
          <v-card-text>
            <v-text-field
              outlined
              required
              label="Name"
              persistent-hint
              hint="Name to identify the project. This will be shown to the users and is required."
              v-model="newProjectData.name"
            ></v-text-field>
            <v-textarea
              outlined
              label="Description"
              persistent-hint
              hint="A short description about the project to the users."
              v-model="newProjectData.description"
            ></v-textarea>
            <v-checkbox
              label="Randomize prompt order"
              persistent-hint
              hint="Whether the prompts will be displayed to users in a random order."
              v-model="newProjectData.randomize_prompt_order"
            >
            </v-checkbox>
            <v-checkbox
              label="Allow repeating sessions"
              persistent-hint
              hint="Whether users can record all prompts and thus complete the project multiple times."
              v-model="newProjectData.allow_concurrent_sessions"
            >
            </v-checkbox>
            <v-switch
              outlined
              label="Active"
              v-model="newProjectData.active"
              persistent-hint
              hint="Whether the project can be seen by the users. This can be set later after setting up the prompts."
            >
            </v-switch>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text @click="isNewProjectDialogShown = false">Cancel</v-btn>
            <v-btn text type="submit">Create</v-btn>
          </v-card-actions>
        </form>
      </v-card>
    </v-dialog>

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
                  @click="
                    newProjectData = {};
                    isNewProjectDialogShown = true;
                  "
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
import { mapActions, mapState } from "vuex";
import NewEditProjectDialog from "../components/NewEditProjectDialog";

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

    isNewProjectDialogShown: false,
    savingNewProject: false,
    newProjectData: {},
  }),

  components: {
    NewEditProjectDialog,
  },

  methods: {
    ...mapActions(["showGlobalSnackbar"]),

    async saveNewProject() {
      this.savingNewProject = true;

      try {
        await axios.post("/projects", this.newProjectData);
        this.isNewProjectDialogShown = false;
        this.loadProjectsTableItems();
        this.showGlobalSnackbar("New project created.");
      } catch (error) {
        this.showGlobalSnackbar(`Cannot save new project. ${error}`);
      }

      this.savingNewProject = false;
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
