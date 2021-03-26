<template>
  <v-container fluid>
    <v-row>
      <v-col>
        <v-card>
          <v-card-title
            ><p v-if="creatingNewProject">Create New Project</p>
            <p v-if="!creatingNewProject">Project Properties</p>
            <v-spacer></v-spacer>
            <v-btn
              icon
              v-if="!projectDetailsBeingEdited"
              @click="startEditingProjectDetails()"
            >
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
            <v-btn
              icon
              v-if="
                projectDetailsBeingEdited &&
                  !projectDetailsBeingSaved &&
                  !creatingNewProject
              "
              @click="cancelEditingProjectDetails()"
            >
              <v-icon>mdi-close</v-icon>
            </v-btn>
            <v-btn
              icon
              v-if="projectDetailsBeingEdited && !projectDetailsBeingSaved"
              @click="stopEditingProjectDetails()"
            >
              <v-icon>mdi-check</v-icon>
            </v-btn>
            <v-progress-circular
              indeterminate
              color="primary"
              v-if="projectDetailsBeingSaved"
            ></v-progress-circular
          ></v-card-title>
          <v-card-text>
            <v-form
              :disabled="!projectDetailsBeingEdited || projectDetailsBeingSaved"
            >
              <v-text-field
                outlined
                label="Name"
                v-model="projectDetails.name"
              ></v-text-field>
              <v-textarea
                outlined
                label="Description"
                v-model="projectDetails.description"
              ></v-textarea>
              <v-checkbox
                label="Randomize prompt order"
                v-model="projectDetails.randomize_prompt_order"
              >
              </v-checkbox>
              <v-checkbox
                label="Allow repeating sessions"
                v-model="projectDetails.allow_concurrent_sessions"
              >
              </v-checkbox>
              <v-switch outlined label="Active" v-model="projectDetails.active">
              </v-switch>
            </v-form>
            <v-alert
              type="success"
              v-if="
                projectDetailsSavingAttempted && projectDetailsSavingSuccess
              "
              >Details successfully saved.</v-alert
            >
            <v-alert
              type="error"
              v-if="
                projectDetailsSavingAttempted && !projectDetailsSavingSuccess
              "
              >Failed to save details. {{ editingFailureMessage }}</v-alert
            >
          </v-card-text>
        </v-card>
      </v-col>
      <v-col v-if="!creatingNewProject">
        <v-card>
          <v-card-title>Statistics</v-card-title>
          <v-card-text>
            <v-simple-table>
              <template v-slot:default>
                <tbody>
                  <tr>
                    <td>Project ID</td>
                    <td>{{ projectDetails.project_id }}</td>
                  </tr>
                  <tr>
                    <td>Created</td>
                    <td>{{ projectDetails.created_at }} (Administraator)</td>
                  </tr>
                  <tr>
                    <td>Last Edited</td>
                    <td>{{ projectDetails.created_at }} (Administraator)</td>
                  </tr>
                  <tr>
                    <td>Prompts</td>
                    <td>{{ projectDetails.num_prompts }}</td>
                  </tr>
                  <tr>
                    <td>Participants</td>
                    <td>{{ projectDetails.num_users }}</td>
                  </tr>
                  <tr>
                    <td>Sessions</td>
                    <td>{{ projectDetails.num_sessions }}</td>
                  </tr>
                  <tr>
                    <td>Recordings</td>
                    <td>{{ projectDetails.num_recordings }} (50 minutes)</td>
                  </tr>
                </tbody>
              </template>
            </v-simple-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-card v-if="!creatingNewProject">
          <v-card-title>Prompts</v-card-title>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
const axios = require("axios");
const dateFns = require("date-fns");

export default {
  computed: {},

  data: () => ({
    creatingNewProject: false,
    projectDetailsBeingEdited: false,
    projectDetailsSavingAttempted: false,
    projectDetailsBeingSaved: false,
    projectDetailsSavingSuccess: false,
    projectDetails: {
      name: "",
      description: "",
      randomize_prompt_order: false,
      allow_concurrent_sessions: false,
      active: false,
    },
    projectDetailsBackup: {},

    statisticsTableItems: [{ metric: "ID", metric_value: "vg" }],
  }),

  methods: {
    startEditingProjectDetails() {
      this.projectDetailsBackup = JSON.parse(
        JSON.stringify(this.projectDetails)
      );
      this.projectDetailsBeingEdited = true;
      this.projectDetailsSavingAttempted = false;
    },

    cancelEditingProjectDetails() {
      this.projectDetails = this.projectDetailsBackup;
      this.projectDetailsBeingEdited = false;
    },

    stopEditingProjectDetails() {
      this.projectDetailsSavingAttempted = false;
      this.projectDetailsBeingSaved = true;

      if (this.creatingNewProject) {
        console.log(JSON.stringify(this.projectDetails));
        axios
          .post(`http://localhost:5000/api/projects/`, this.projectDetails)
          .then((response) => {
            this.projectDetailsBeingSaved = false;
            this.projectDetailsSavingAttempted = true;
            this.projectDetailsSavingSuccess = true;
            this.projectDetailsBeingEdited = false;

            this.$router.replace({
              name: "Project Details",
              params: { projectId: response.data.project_id },
            });
          })
          .catch((error) => {
            this.projectDetailsBeingSaved = false;
            this.projectDetailsSavingAttempted = true;
            this.editingFailureMessage = error;
          });
      } else {
        axios
          .put(
            `http://localhost:5000/api/projects/${this.$route.params.projectId}`,
            this.projectDetails
          )
          .then((response) => {
            this.projectDetailsBeingSaved = false;
            this.projectDetailsSavingAttempted = true;
            this.projectDetailsSavingSuccess = true;
            this.projectDetailsBeingEdited = false;
          })
          .catch((error) => {
            this.projectDetailsBeingSaved = false;
            this.projectDetailsSavingAttempted = true;
            this.editingFailureMessage = error;
          });
      }
    },
  },

  created() {
    if (this.$route.params.projectId === "new") {
      this.creatingNewProject = true;
      this.projectDetailsBeingEdited = true;
    }
  },

  mounted() {
    if (!this.creatingNewProject) {
      axios
        .get(
          `http://localhost:5000/api/projects/${this.$route.params.projectId}`
        )
        .then((response) => {
          this.projectDetails = response.data;
          this.projectDetails.created_at = dateFns.format(
            dateFns.parseJSON(this.projectDetails.created_at),
            "dd.MM.yyyy hh:mm"
          );
        })
        .catch((error) => {
          console.log(error);
        });
    }
  },
};
</script>

<style></style>
