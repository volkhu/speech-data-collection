<template>
  <v-container fluid>
    <!-- Edit project dialog -->
    <v-dialog max-width="768px" v-model="isEditedProjectDialogShown" persistent>
      <v-card>
        <v-card-title>Edit Project</v-card-title>
        <v-card-subtitle align="left" class="pt-1"
          >Edit this speech data collection project.</v-card-subtitle
        >
        <form
          @submit.prevent="saveEditedProject"
          :disabled="savingEditedProject"
        >
          <v-card-text>
            <v-text-field
              outlined
              required
              label="Name"
              persistent-hint
              hint="Name to identify the project. This will be shown to the users and is required."
              v-model="editedProjectData.name"
            ></v-text-field>
            <v-textarea
              outlined
              label="Description"
              persistent-hint
              hint="A short description about the project to the users."
              v-model="editedProjectData.description"
            ></v-textarea>
            <v-checkbox
              label="Randomize prompt order"
              persistent-hint
              hint="Whether the prompts will be displayed to users in a random order."
              v-model="editedProjectData.randomize_prompt_order"
            >
            </v-checkbox>
            <v-checkbox
              label="Allow repeating sessions"
              persistent-hint
              hint="Whether users can record all prompts and thus complete the project multiple times."
              v-model="editedProjectData.allow_concurrent_sessions"
            >
            </v-checkbox>
            <v-switch
              outlined
              label="Active"
              v-model="editedProjectData.active"
              persistent-hint
              hint="Whether the project can be seen by the users. This can be set later after setting up the prompts."
            >
            </v-switch>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text @click="isEditedProjectDialogShown = false"
              >Cancel</v-btn
            >
            <v-btn text type="submit">Save</v-btn>
          </v-card-actions>
        </form>
      </v-card>
    </v-dialog>

    <v-row>
      <v-col>
        <v-card>
          <v-card-title>Project</v-card-title>
          <v-card-text>
            <v-simple-table>
              <template v-slot:default>
                <tbody>
                  <tr>
                    <td>Name</td>
                    <td>{{ projectDetails.name }}</td>
                  </tr>
                  <tr>
                    <td>Description</td>
                    <td>
                      {{ projectDetails.description }}
                    </td>
                  </tr>
                  <tr>
                    <td>Randomize prompt order</td>
                    <td>
                      <v-checkbox
                        disabled
                        v-model="projectDetails.randomize_prompt_order"
                      ></v-checkbox>
                    </td>
                  </tr>
                  <tr>
                    <td>Allow repeated sessions</td>
                    <td>
                      <v-checkbox
                        disabled
                        v-model="projectDetails.allow_concurrent_sessions"
                      ></v-checkbox>
                    </td>
                  </tr>
                  <tr>
                    <td>Active</td>
                    <td>
                      <v-checkbox
                        disabled
                        v-model="projectDetails.active"
                      ></v-checkbox>
                    </td>
                  </tr>
                </tbody>
              </template>
            </v-simple-table>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="primary"
              @click="
                editedProjectData = JSON.parse(JSON.stringify(projectDetails));
                isEditedProjectDialogShown = true;
              "
            >
              EDIT DETAILS
            </v-btn>
            <v-btn
              color="primary"
              link
              :href="recordingsDownloadUrl"
              target="_blank"
            >
              DOWNLOAD RECORDINGS
            </v-btn>
          </v-card-actions>
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
                    <td>
                      {{ projectDetails.created_at }}
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
          <!-- Batch Upload Prompts dialog -->
          <v-dialog
            v-model="showBatchUploadPrompts"
            max-width="768px"
            persistent
          >
            <v-card>
              <v-card-title>Batch Upload Prompts</v-card-title>
              <v-card-subtitle align="left" class="pt-1"
                >Here you can upload a text file where each row will be treated
                as a separate prompt description text and added to the
                database.</v-card-subtitle
              >
              <v-card-actions>
                <v-container>
                  <v-row
                    ><v-col>
                      <v-file-input
                        outlined
                        hint="Upload a text file with a text prompt on each line."
                        persistent-hint
                        prepend-icon=""
                        append-icon="mdi-text"
                        accept=".txt"
                        label="Upload Text File (.txt)"
                        v-model="batchUploadFilePickerModel"
                        show-size=""
                        @change="onBatchUploadFileChanged"
                      ></v-file-input> </v-col
                  ></v-row>
                  <v-row>
                    <v-col>
                      Preview
                      <v-simple-table>
                        <template v-slot:default>
                          <thead>
                            <tr>
                              <th class="text-left">
                                Prompt Description
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr
                              v-for="item in batchUploadPreviewPrompts"
                              :key="item"
                            >
                              <td>{{ item }}</td>
                            </tr>
                          </tbody>
                        </template>
                      </v-simple-table>
                    </v-col>
                  </v-row>
                  <v-row v-if="batchUploadError"
                    ><v-col>
                      <v-alert type="error"
                        >Batch upload failed.
                        {{ batchUploadErrorMessage }}</v-alert
                      ></v-col
                    ></v-row
                  ><v-row
                    ><v-col align="right">
                      <v-btn text @click="cancelBatchUploadDialog"
                        >Cancel</v-btn
                      >
                      <v-btn text @click="confirmBatchUploadDialog"
                        >Confirm</v-btn
                      >
                    </v-col></v-row
                  >
                </v-container>
              </v-card-actions>
            </v-card>
          </v-dialog>

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
            <v-btn
              color="primary"
              @click="batchUploadPromptsClicked"
              class="mr-2"
            >
              BATCH UPLOAD PROMPTS
            </v-btn>
            <v-btn color="primary" @click="openNewPromptDialog">
              NEW PROMPT
            </v-btn>
          </v-card-title>
          <v-card-text>
            <v-data-table :headers="promptsTableHeaders" :items="prompts">
              <template v-slot:item.image="{ item }">
                <v-img
                  v-if="item.image"
                  contain
                  max-height="50"
                  max-width="200"
                  :src="item.image_data"
                ></v-img>
              </template>
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
import { mapActions, mapState } from "vuex";

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

    recordingsDownloadUrl: "",

    showBatchUploadPrompts: false,
    batchUploadError: false,
    batchUploadErrorMessage: "",
    batchUploadFilePickerModel: null,
    batchUploadPreviewPrompts: [],

    isEditedProjectDialogShown: false,
    savingEditedProject: false,
    editedProjectData: {},
  }),

  methods: {
    ...mapActions(["showGlobalSnackbar"]),

    cancelBatchUploadDialog() {
      this.showBatchUploadPrompts = false;
    },

    async saveEditedProject() {
      this.savingEditedProject = true;

      try {
        await axios.put(
          `/projects/${this.$route.params.projectId}`,
          this.editedProjectData
        );
        this.isEditedProjectDialogShown = false;
        this.loadProjectDetails();
        this.showGlobalSnackbar("Project details saved.");
      } catch (error) {
        this.showGlobalSnackbar(`Cannot save project details. ${error}`);
      }

      this.savingEditedProject = false;
    },

    confirmBatchUploadDialog() {
      this.batchUploadPreviewPrompts.forEach((item) => {
        axios
          .post(`/prompts/`, {
            project_id: this.$route.params.projectId,
            description: item,
          })
          .then((response) => {
            console.log(response);
            this.loadPrompts();
            this.showBatchUploadPrompts = false;
          })
          .catch((error) => {
            this.batchUploadError = true;
            this.batchUploadErrorMessage = error;
          });
      });
    },

    batchUploadPromptsClicked() {
      this.batchUploadError = false;
      this.batchUploadFilePickerModel = null;
      this.batchUploadPreviewPrompts = [];
      this.showBatchUploadPrompts = true;
    },

    onBatchUploadFileChanged(file) {
      if (file == null) {
        return;
      }

      // construct callback for filereader
      const fileReader = new FileReader();
      fileReader.onload = (event) => {
        this.batchUploadPreviewPrompts = event.target.result.split("\n");
        console.log(this.batchUploadPreviewPrompts);
      };

      // start loading the file
      fileReader.readAsText(file);
    },

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
      this.newPromptImage = this.newPromptData.image_data;
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
          .put(`/prompts/${this.editedPromptId}`, this.newPromptData)
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
          .post(`/prompts/`, this.newPromptData)
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
        .delete(`/prompts/${this.deletePromptId}`)
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
          .post(`/projects/`, this.projectDetails)
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
          .put(`/projects/${this.$route.params.projectId}`, this.projectDetails)
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
      this.recordingsDownloadUrl = `${process.env.VUE_APP_ENDPOINT_BASE_URL}/projects/${this.$route.params.projectId}/downloadRecordings`;

      axios
        .get(`/projects/${this.$route.params.projectId}`)
        .then((response) => {
          console.log(JSON.stringify(response));
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
        .get(`/projects/${this.$route.params.projectId}/prompts`)
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
