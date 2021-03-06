<template>
  <v-container fluid>
    <!-- Edit project details dialog -->
    <new-edit-project-dialog
      :isShown="isEditProjectDetailsDialogShown"
      @update:isShown="isEditProjectDetailsDialogShown = $event"
      v-model="editProjectDetailsDialogData"
      @projectDetailsSaved="loadProjectDetails"
    />

    <v-row>
      <!-- Project details card -->
      <v-col>
        <v-card>
          <v-card-title
            >Project Details<v-spacer></v-spacer>
            <v-btn icon class="mr-2" @click="loadProjectDetails"
              ><v-icon>mdi-refresh</v-icon></v-btn
            >
            <v-btn color="primary" @click="openEditProjectDetailsDialog">
              EDIT DETAILS
            </v-btn>
          </v-card-title>
          <v-card-text
            ><project-details-table :projectDetails="projectDetails"
          /></v-card-text>
          <v-progress-linear
            indeterminate
            v-show="loadingProjectDetails"
          ></v-progress-linear>
        </v-card>
      </v-col>

      <!-- Project statistics card -->
      <v-col>
        <v-card>
          <v-card-title
            >Statistics<v-spacer></v-spacer>
            <v-btn icon class="mr-2" @click="loadProjectDetails"
              ><v-icon>mdi-refresh</v-icon></v-btn
            >
            <form
              method="post"
              :action="recordingsDownloadUrl"
              @submit="downloadRecordingsButtonClicked"
            >
              <input
                type="hidden"
                name="authorization"
                :value="downloadRecordingsAuthToken"
              />
              <v-btn color="primary" type="submit">
                DOWNLOAD RECORDINGS
              </v-btn>
            </form></v-card-title
          >
          <v-card-text
            ><project-statistics-table :projectDetails="projectDetails"
          /></v-card-text>
          <v-progress-linear
            indeterminate
            v-show="loadingProjectDetails"
          ></v-progress-linear>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <!-- Prompts card -->
      <v-col>
        <prompts-card
          :projectId="projectId"
          @promptsChanged="loadProjectDetails"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import axios from "axios";
import { mapActions } from "vuex";
import datetime from "@/mixins/datetime";
import NewEditProjectDialog from "@/components/projects/NewEditProjectDialog";
import ProjectDetailsTable from "@/components/projects/ProjectDetailsTable";
import ProjectStatisticsTable from "@/components/projects/ProjectStatisticsTable";
import PromptsCard from "@/components/projects/prompts/PromptsCard";

export default {
  data: () => ({
    projectId: 0,

    // project details
    loadingProjectDetails: true,
    projectDetails: {},

    // edit project details
    isEditProjectDetailsDialogShown: false,
    editProjectDetailsDialogData: {},

    recordingsDownloadUrl: "",
    downloadRecordingsAuthToken: "",
  }),

  components: {
    NewEditProjectDialog,
    ProjectDetailsTable,
    ProjectStatisticsTable,
    PromptsCard,
  },

  methods: {
    ...mapActions(["showGlobalSnackbar"]),

    /**
     * Called when user wants to download this project's recordings. In
     * here the auth token will be saved in the download form hidden
     * input to pass along to the server via a POST request in the end.
     */
    downloadRecordingsButtonClicked(event) {
      if (this.$gAuth.isInit && this.$gAuth.isAuthorized) {
        this.downloadRecordingsAuthToken = this.$gAuth.GoogleAuth.currentUser
          .get()
          .getAuthResponse().id_token;
      } else {
        this.showGlobalSnackbar(
          `Cannot download recordings. Login token unavailable.`
        );
        event.preventDefault();
      }
    },

    /**
     * Show the dialog to edit this project's details.
     */
    openEditProjectDetailsDialog() {
      this.editProjectDetailsDialogData = JSON.parse(
        JSON.stringify(this.projectDetails)
      );

      this.isEditProjectDetailsDialogShown = true;
    },

    /**
     * Load or update this project's details from the back-end API.
     */
    async loadProjectDetails() {
      this.loadingProjectDetails = true;
      this.recordingsDownloadUrl = `${process.env.VUE_APP_ENDPOINT_BASE_URL}/projects/${this.$route.params.projectId}/downloadRecordings`;

      try {
        const projectDetailsResponse = await axios.get(
          `/projects/${this.$route.params.projectId}`
        );
        this.projectDetails = projectDetailsResponse.data;
      } catch (error) {
        this.showGlobalSnackbar(`Cannot load project details. ${error}`);
      }

      this.loadingProjectDetails = false;
    },
  },

  mixins: [datetime],

  created() {
    this.projectId = this.$route.params.projectId;
  },

  mounted() {
    this.loadProjectDetails();
  },
};
</script>

<style></style>
