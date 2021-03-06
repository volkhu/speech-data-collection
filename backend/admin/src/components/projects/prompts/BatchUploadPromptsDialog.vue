<template>
  <v-dialog
    max-width="768px"
    persistent
    :value="isShown"
    @input="setIsShown($event)"
  >
    <v-card>
      <v-card-title>Batch Upload Prompts</v-card-title>
      <v-card-subtitle align="left" class="pt-1"
        >Here you can upload a text file where each row will be treated as a
        separate text prompt and added to the database for this
        project.</v-card-subtitle
      >
      <form @submit.prevent="batchUploadPrompts">
        <v-card-text>
          <v-file-input
            :disabled="batchUploadingPrompts"
            outlined
            hint="Upload a text file with a text prompt on each line."
            persistent-hint
            required
            prepend-icon=""
            append-icon="mdi-text"
            accept=".txt"
            label="Upload Text File (.txt)"
            v-model="inputFilePicker"
            show-size=""
            @change="onInputFileChange"
          ></v-file-input>
          <v-simple-table v-show="previewPrompts.length">
            <template v-slot:default>
              <thead>
                <tr>
                  <th class="text-left">
                    #
                  </th>
                  <th class="text-left">
                    Preview Prompt Description
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in previewPrompts" :key="index">
                  <td>{{ index + 1 }}</td>
                  <td>{{ item }}</td>
                </tr>
              </tbody>
            </template>
          </v-simple-table>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            text
            @click="setIsShown(false)"
            :disabled="batchUploadingPrompts"
            >Cancel</v-btn
          >
          <v-btn
            text
            type="submit"
            :disabled="batchUploadingPrompts"
            color="primary"
            >Confirm</v-btn
          >
        </v-card-actions>
      </form>
      <v-progress-linear
        indeterminate
        v-show="batchUploadingPrompts"
      ></v-progress-linear>
    </v-card>
  </v-dialog>
</template>

<script>
import axios from "axios";
import { mapActions } from "vuex";

export default {
  props: ["isShown", "projectId"],

  data: () => ({
    batchUploadingPrompts: false,
    inputFilePicker: null,
    previewPrompts: [],
  }),

  methods: {
    ...mapActions(["showGlobalSnackbar"]),

    /**
     * Clean the form fields, including the file picker.
     */
    resetForm() {
      this.inputFilePicker = null;
      this.previewPrompts = [];
    },

    /**
     * Tell the parent component of this component's visibility status.
     */
    setIsShown(value) {
      this.$emit("update:isShown", value);
    },

    /**
     * When the input file changes, read its contents using FileReader
     * and update the prompts preview table accordingly.
     *
     * @param newFile new file that was picked
     */
    onInputFileChange(newFile) {
      if (newFile != null) {
        // construct callback for filereader
        const fileReader = new FileReader();
        fileReader.onload = (event) => {
          this.updatePreviewPromptsFromFileString(event.target.result);
        };

        // start loading the file
        fileReader.readAsText(newFile);
      } else {
        this.resetForm();
      }
    },

    /**
     * Update the preview table showing how the prompts
     * were read from the chosen file.
     *
     * @param fileString contents of the chosen file as a string
     */
    updatePreviewPromptsFromFileString(fileString) {
      const nonEmptyLines = fileString
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length);

      this.previewPrompts = nonEmptyLines;
    },

    /**
     * Upload the list of prompts that was parsed from the uploaded
     * text file and is currently shown in the preview table to the
     * back-end API.
     */
    async batchUploadPrompts() {
      this.batchUploadingPrompts = true;

      try {
        let numPromptsAdded = 0;
        for (const previewPrompt of this.previewPrompts) {
          await axios.post("/prompts", {
            project_id: this.projectId,
            instructions: "",
            description: previewPrompt,
          });

          numPromptsAdded++;
        }

        this.$emit("batchPromptsUploaded");
        this.setIsShown(false);

        this.showGlobalSnackbar(`Batch uploaded ${numPromptsAdded} prompts.`);
      } catch (error) {
        this.showGlobalSnackbar(`Batch uploading prompts failed. ${error}`);
      }

      this.batchUploadingPrompts = false;
    },
  },

  watch: {
    isShown(value) {
      // reset the form if the dialog has been shown or hidden
      if (value) {
        this.resetForm();
      }
    },
  },
};
</script>

<style></style>
