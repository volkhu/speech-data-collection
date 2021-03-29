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
                required
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
                    <td>{{ projectDetails.created_at }}</td>
                  </tr>
                  <tr>
                    <td>Last Edited</td>
                    <td>
                      {{ projectDetails.last_edited_at }}
                    </td>
                  </tr>
                  <tr>
                    <td>Prompts</td>
                    <td>{{ prompts.length }}</td>
                  </tr>
                  <tr>
                    <td>Participants</td>
                    <td>{{ projectDetails.num_participants }}</td>
                  </tr>
                  <tr>
                    <td>Sessions</td>
                    <td>{{ projectDetails.num_sessions }}</td>
                  </tr>
                  <tr>
                    <td>Recordings</td>
                    <td>
                      {{ projectDetails.num_recordings }} ({{
                        projectDetails.total_recordings_duration.toFixed(2)
                      }}
                      seconds in total)
                    </td>
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
          <!-- Delete Prompt confirmation dialog -->
          <v-dialog v-model="deletePromptDialog" max-width="512px">
            <v-card>
              <v-card-title
                >Are you sure you want to delete prompt
                {{ deletePromptId }}?</v-card-title
              >
              <v-card-actions>
                <v-container>
                  <v-row v-if="deletePromptError"
                    ><v-col>
                      <v-alert type="error"
                        >Failed to delete prompt.
                        {{ deletePromptErrorMessage }}</v-alert
                      ></v-col
                    ></v-row
                  ><v-row
                    ><v-col align="right">
                      <v-btn text @click="cancelDeletePromptDialog"
                        >Cancel</v-btn
                      >
                      <v-btn text @click="confirmDeletePromptDialog"
                        >Confirm</v-btn
                      >
                    </v-col></v-row
                  >
                </v-container>
              </v-card-actions>
            </v-card>
          </v-dialog>

          <!-- New/edit prompt dialog -->
          <v-dialog persistent v-model="newPromptDialog" max-width="768px">
            <v-card>
              <v-card-title v-if="editedPromptId">Edit Prompt</v-card-title>
              <v-card-title v-if="!editedPromptId">New Prompt</v-card-title>
              <v-card-text>
                <form @submit.prevent="submitPromptDialog">
                  <v-container>
                    <v-row>
                      <v-col
                        ><v-textarea
                          outlined
                          required
                          label="Description"
                          hint="Usually the text shown to the user for reading. If uploading an image, this will not be shown to the user, but can still be used as a note about the image for administrators."
                          persistent-hint
                          v-model="newPromptData.description"
                        ></v-textarea>
                      </v-col>
                    </v-row>
                    <v-row>
                      <v-col>
                        <v-file-input
                          outlined
                          hint="An image to be shown to the user to speak about instead of the description text."
                          persistent-hint
                          prepend-icon=""
                          append-icon="mdi-camera"
                          accept="image/jpeg"
                          label="Upload Image (optional)"
                          ref="promptImageUpload"
                          v-model="fileUploadModel"
                          show-size=""
                          @change="onPromptImageChanged"
                        ></v-file-input>
                        <v-img
                          v-if="newPromptImage"
                          contain
                          :src="newPromptImage"
                        ></v-img>
                      </v-col>
                    </v-row>
                    <v-row>
                      <v-col
                        ><v-text-field
                          outlined
                          label="Custom Instructions (optional)"
                          hint="By default the user will be told to read the prompt description text or describe the image. Optionally it is possible to replace such instructions with a custom message here that will be displayed to the user alongside the description/image."
                          persistent-hint
                          v-model="newPromptData.instructions"
                        ></v-text-field
                      ></v-col>
                    </v-row>
                    <v-row>
                      <v-col>
                        <v-alert type="error" v-if="newPromptError"
                          >Failed to save prompt.
                          {{ newPromptErrorMessage }}</v-alert
                        >
                      </v-col>
                    </v-row>
                    <v-row
                      ><v-col align="right">
                        <v-btn text @click="cancelNewPromptDialog"
                          >Cancel</v-btn
                        >
                        <v-btn text type="submit">Save</v-btn>
                      </v-col></v-row
                    >
                  </v-container>
                </form>
              </v-card-text>
            </v-card>
          </v-dialog>

          <v-card-title
            >Prompts
            <v-spacer></v-spacer>
            <v-btn color="primary" @click="openNewPromptDialog">
              NEW PROMPT
            </v-btn>
          </v-card-title>
          <v-card-text>
            <v-data-table :headers="promptsTableHeaders" :items="prompts">
              <template v-slot:item.actions="{ item }">
                <v-btn icon @click="openEditPromptDialog(item.prompt_id)">
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
                <v-btn icon @click="openDeletePromptDialog(item.prompt_id)">
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </template>
            </v-data-table>
          </v-card-text>
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
      total_recordings_duration: 0,
    },
    projectDetailsBackup: {},

    promptsTableHeaders: [
      { text: "ID", value: "prompt_id" },
      { text: "Description", value: "description" },
      { text: "Image", value: "image" },
      { text: "Custom Instructions", value: "instructions" },
      { text: "Created", value: "created_at" },
      { text: "Last Edited", value: "last_edited_at" },
      { text: "Actions", value: "actions", sortable: false, align: "center" },
    ],
    prompts: [],

    deletePromptDialog: false,
    deletePromptId: 0,
    deletePromptError: false,
    deletePromptErrorMessage: "",

    editedPromptId: 0,
    newPromptData: {},
    newPromptDialog: false,
    newPromptError: false,
    newPromptErrorMessage: "",
    newPromptImage: "",
    fileUploadModel: null,
  }),

  methods: {
    onPromptImageChanged(file) {
      if (file == null) {
        this.newPromptImage = "";
        return;
      }

      // construct callback for filereader
      const fileReader = new FileReader();
      fileReader.onload = (event) => {
        this.newPromptImage = event.target.result;
      };

      // start loading the file
      fileReader.readAsDataURL(file);
    },

    getPromptById(promptId) {
      return this.prompts.find((item) => item.prompt_id === promptId);
    },

    openEditPromptDialog(promptId) {
      this.newPromptData = JSON.parse(
        JSON.stringify(this.getPromptById(promptId))
      );
      this.editedPromptId = promptId;
      this.newPromptDialog = true;
      this.newPromptImage = "";
      this.fileUploadModel = null;
    },

    openNewPromptDialog() {
      this.editedPromptId = 0;
      this.newPromptDialog = true;
      this.newPromptData = {};
      this.newPromptError = false;
      this.newPromptImage = "";
      this.fileUploadModel = null;
    },

    cancelNewPromptDialog() {
      this.newPromptDialog = false;
      this.newPromptData = {};
      this.newPromptError = false;
      this.newPromptImage = "";
    },

    submitPromptDialog() {
      if (this.newPromptImage) {
        this.newPromptData.image = true;
        this.newPromptData.image_data = this.newPromptImage;
      }

      console.log(this.newPromptData);

      if (this.editedPromptId) {
        // update existing prompt
        axios
          .put(
            `http://localhost:5000/api/prompts/${this.editedPromptId}`,
            this.newPromptData
          )
          .then((response) => {
            this.loadPrompts();
            this.newPromptData = {};
            this.newPromptDialog = false;
            this.newPromptError = false;
          })
          .catch((error) => {
            this.newPromptError = true;
            this.newPromptErrorMessage = error;
            console.log(error);
          });
      } else {
        // new prompt
        this.newPromptData.project_id = this.$route.params.projectId;

        axios
          .post(`http://localhost:5000/api/prompts/`, this.newPromptData)
          .then((response) => {
            this.loadPrompts();
            this.newPromptData = {};
            this.newPromptDialog = false;
          })
          .catch((error) => {
            this.newPromptError = true;
            this.newPromptErrorMessage = error;
            console.log(error);
          });
      }
    },

    openDeletePromptDialog(promptId) {
      this.deletePromptError = false;
      this.deletePromptId = promptId;
      this.deletePromptDialog = true;
    },
    cancelDeletePromptDialog() {
      this.deletePromptDialog = false;
    },
    confirmDeletePromptDialog() {
      if (!this.deletePromptDialog) {
        return;
      }

      this.deletingPrompt = true;
      axios
        .delete(`http://localhost:5000/api/prompts/${this.deletePromptId}`)
        .then((response) => {
          this.loadPrompts();

          this.deletePromptDialog = false;
          console.log(response.data);
        })
        .catch((error) => {
          this.deletePromptError = true;
          this.deletePromptErrorMessage = error;
          console.log(error);
        });
    },

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

    loadProjectDetails() {
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
          this.projectDetails.last_edited_at = dateFns.format(
            dateFns.parseJSON(this.projectDetails.last_edited_at),
            "dd.MM.yyyy hh:mm"
          );
        })
        .catch((error) => {
          console.log(error);
        });
    },

    loadPrompts() {
      axios
        .get(
          `http://localhost:5000/api/projects/${this.$route.params.projectId}/prompts`
        )
        .then((response) => {
          this.prompts = response.data.map((item) => {
            return {
              ...item,
              created_at: dateFns.format(
                dateFns.parseJSON(item.created_at),
                "dd.MM.yyyy hh:mm"
              ),
              last_edited_at: dateFns.format(
                dateFns.parseJSON(item.last_edited_at),
                "dd.MM.yyyy hh:mm"
              ),
            };
          });
        })
        .catch((error) => {
          console.log(error);
        });
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
      this.loadProjectDetails();
      this.loadPrompts();
    }
  },
};
</script>

<style></style>
