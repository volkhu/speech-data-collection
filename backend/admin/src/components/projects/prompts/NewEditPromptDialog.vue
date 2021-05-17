<template>
  <v-dialog
    max-width="768px"
    persistent
    :value="isShown"
    @input="setIsShown($event)"
  >
    <v-card>
      <v-card-title>{{ dialogTitle }}</v-card-title>
      <v-card-subtitle align="left" class="pt-1">{{
        dialogSubtitle
      }}</v-card-subtitle>
      <form @submit.prevent="savePrompt">
        <v-card-text>
          <v-text-field
            outlined
            label="Custom Prompt Instructions (optional)"
            hint="By default the user will be told to read the prompt description text or describe the image. Optionally it is possible to replace such instructions with a custom message here that will be displayed to the user alongside the description/image."
            persistent-hint
            maxlength="255"
            :disabled="formBusy"
            :value="value.instructions"
            @input="updateComponentValue('instructions', $event)"
          ></v-text-field>
          <v-textarea
            outlined
            label="Prompt Text (optional)"
            hint="Usually the text shown to the user for reading. If uploading an image, this will not be shown to the user, but can still be used as a note about the image for administrators."
            persistent-hint
            :disabled="formBusy"
            :value="value.description"
            @input="updateComponentValue('description', $event)"
          ></v-textarea>
          <v-file-input
            outlined
            hint="Upload an image to be shown to the user to speak about instead of the description text."
            persistent-hint
            prepend-icon=""
            append-icon="mdi-camera"
            accept="image/jpeg,image/png"
            label="Prompt Image (.jpg, .png) (optional)"
            ref="promptImageUpload"
            :disabled="formBusy"
            v-model="imageFilePicker"
            @change="onImageFileChange"
          ></v-file-input>
          <v-img
            v-if="value.image_data"
            contain
            :src="value.image_data"
          ></v-img>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text :disabled="formBusy" @click="setIsShown(false)"
            >Cancel</v-btn
          >
          <v-btn text :disabled="formBusy" type="submit" color="primary">{{
            submitButtonText
          }}</v-btn>
        </v-card-actions>
        <v-progress-linear indeterminate v-show="formBusy"></v-progress-linear>
      </form>
    </v-card>
  </v-dialog>
</template>

<script>
import axios from "axios";
import { mapActions } from "vuex";

export default {
  props: ["isShown", "value"],

  data: () => ({
    formBusy: false,
    imageFilePicker: null,
  }),

  computed: {
    /**
     * Compute the title for this dialog depending if
     * this is a new prompt or an existing one that is
     * being updated.
     *
     * @returns the title of this dialog
     */
    dialogTitle() {
      return this.value.prompt_id ? "Edit Prompt" : "Create New Prompt";
    },

    /**
     * Specify a different dialog subtitle depending if a new
     * prompt is being created or an existing one updated.
     *
     * @returns dialog's subtitle as a string
     */
    dialogSubtitle() {
      return this.value.prompt_id
        ? "Edit this prompt's details."
        : "Create a new prompt assigned to this project.";
    },

    /**
     * Depending on if this prompt is being updated or created,
     * the text on the dialog's submit button needs to be different.
     *
     * @returns submit button text as a string
     */
    submitButtonText() {
      return this.value.prompt_id ? "Save" : "Create";
    },
  },

  methods: {
    ...mapActions(["showGlobalSnackbar"]),

    /**
     * Tell the parent component of this component's visibility status.
     */
    setIsShown(value) {
      this.$emit("update:isShown", value);
    },

    /**
     * Update this component's value by notifying the parent component about it.
     */
    updateComponentValue(elementKey, elementValue) {
      this.$emit("input", { ...this.value, [elementKey]: elementValue });
    },

    /**
     * Called when the content of the image file picker has been changed. If it is
     * empty, remove the preview image. If not, use FileReader to read its contents
     * and update the preview accordingly.
     *
     * @param newFile new file that was chosen
     */
    onImageFileChange(newFile) {
      if (newFile != null) {
        // construct callback for filereader
        const fileReader = new FileReader();
        fileReader.onload = (event) => {
          this.updateComponentValue("image_data", event.target.result);
        };

        // start loading the file
        fileReader.readAsDataURL(newFile);
      } else {
        this.removeImage();
      }
    },

    /**
     * Reset the image picker to an empty state.
     */
    resetImagePicker() {
      this.imageFilePicker = null;
    },

    /**
     * Set the image picker to a blank state representing that an image is present,
     * but was not uploaded in the current session. This way the cancel icon will
     * still be shown and the user can click it to remove the image from the prompt
     * altogether.
     */
    setBlankImagePicker() {
      this.imageFilePicker = [{}];
    },

    /**
     * Remove the image from this prompt.
     */
    removeImage() {
      this.resetImagePicker();
      this.updateComponentValue("image_data", null);
    },

    /**
     * Load details about the prompt that this dialog is supposed to represent. This
     * includes a full-size image if it is present.
     */
    async loadPrompt() {
      this.formBusy = true;

      try {
        const promptResponse = await axios.get(
          `/prompts/${this.value.prompt_id}`
        );

        if (promptResponse.data.image) {
          this.setBlankImagePicker(); // show the clear button to user for removing the image
        }

        // update value prop with loaded data
        this.$emit("input", { ...this.value, ...promptResponse.data });
      } catch (error) {
        this.showGlobalSnackbar(`Cannot load prompt. ${error}`);
        this.setIsShown(false);
      }

      this.formBusy = false;
    },

    /**
     * Create or save this prompt on the back-end API.
     */
    async savePrompt() {
      this.formBusy = true;

      try {
        if (this.value.prompt_id) {
          await axios.put(`/prompts/${this.value.prompt_id}`, this.value);
        } else {
          await axios.post("/prompts", this.value);
        }

        this.showGlobalSnackbar("Prompt saved.");
        this.setIsShown(false);

        this.$emit("promptSaved");
      } catch (error) {
        this.showGlobalSnackbar(`Cannot save prompt. ${error}`);
      }

      this.formBusy = false;
    },

    /**
     * When this dialog is shown, reset the image picker before loading the prompt.
     */
    onShowDialog() {
      this.resetImagePicker();

      if (this.value.prompt_id) {
        this.loadPrompt();
      }
    },
  },

  watch: {
    isShown(value) {
      // the show dialog event hook is implemented from here
      if (value) {
        this.onShowDialog();
      }
    },
  },
};
</script>

<style></style>
