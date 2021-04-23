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
            :disabled="savingPrompt"
            :value="value.instructions"
            @input="updateComponentValue('instructions', $event)"
          ></v-text-field>
          <v-textarea
            outlined
            label="Prompt Text (optional)"
            hint="Usually the text shown to the user for reading. If uploading an image, this will not be shown to the user, but can still be used as a note about the image for administrators."
            persistent-hint
            :disabled="savingPrompt"
            :value="value.description"
            @input="updateComponentValue('description', $event)"
          ></v-textarea>
          <v-file-input
            outlined
            hint="Upload an image to be shown to the user to speak about instead of the description text."
            persistent-hint
            prepend-icon=""
            append-icon="mdi-camera"
            accept="image/jpeg"
            label="Prompt Image (.jpg) (optional)"
            ref="promptImageUpload"
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
          <v-btn text :disabled="savingPrompt" @click="setIsShown(false)"
            >Cancel</v-btn
          >
          <v-btn text :disabled="savingPrompt" type="submit">{{
            submitButtonText
          }}</v-btn>
        </v-card-actions>
        <v-progress-linear
          indeterminate
          v-show="savingPrompt"
        ></v-progress-linear>
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
    savingPrompt: false,
    imageFilePicker: null,
  }),

  computed: {
    dialogTitle() {
      return this.value.prompt_id ? "Edit Prompt" : "Create New Prompt";
    },

    dialogSubtitle() {
      return this.value.prompt_id
        ? "Edit this prompt's details."
        : "Create a new prompt assigned to this project.";
    },

    submitButtonText() {
      return this.value.prompt_id ? "Save" : "Create";
    },
  },

  methods: {
    ...mapActions(["showGlobalSnackbar"]),

    setIsShown(value) {
      this.$emit("update:isShown", value);
    },

    updateComponentValue(elementKey, elementValue) {
      this.$emit("input", { ...this.value, [elementKey]: elementValue });
    },

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

    resetImagePicker() {
      this.imageFilePicker = null;
    },

    removeImage() {
      this.resetImagePicker();
      this.updateComponentValue("image_data", null);
    },

    async savePrompt() {
      this.savingPrompt = true;
      console.log(JSON.stringify(this.value));

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

      this.savingPrompt = false;
    },
  },

  watch: {
    isShown(value) {
      if (value) {
        this.resetImagePicker();

        if (this.value.image_data) {
          this.imageFilePicker = "";
        }
      }
    },
  },
};
</script>

<style></style>
