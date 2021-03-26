<template>
  <v-container fluid>
    <v-row>
      <v-col>
        <v-card>
          <v-card-title
            >Project Details<v-spacer></v-spacer>
            <v-btn
              icon
              v-if="!projectDetailsBeingEdited"
              @click="startEditingProjectDetails()"
            >
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
            <v-btn
              icon
              v-if="projectDetailsBeingEdited && !projectDetailsBeingSaved"
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
      <v-col fill-height>
        <v-card>
          <v-card-title>Statistics</v-card-title>
        </v-card>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-card>
          <v-card-title>Prompts (0)</v-card-title>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
const axios = require("axios");

export default {
  data: () => ({
    projectDetailsBeingEdited: false,
    projectDetailsSavingAttempted: false,
    projectDetailsBeingSaved: false,
    projectDetailsSavingSuccess: false,
    projectDetails: [],
    projectDetailsBackup: [],
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
    },
  },

  mounted() {
    axios
      .get(`http://localhost:5000/api/projects/${this.$route.params.projectId}`)
      .then((response) => {
        this.projectDetails = response.data;
      })
      .catch((error) => {
        console.log(error);
      });
  },
};
</script>

<style></style>
