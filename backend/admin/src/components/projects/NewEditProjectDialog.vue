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
      <form @submit.prevent="saveProjectDetails">
        <v-card-text>
          <v-text-field
            outlined
            required
            label="Name"
            maxlength="64"
            persistent-hint
            hint="Name to identify the project. This will be shown to the users and is required."
            :disabled="savingProjectDetails"
            :value="value.name"
            @input="updateComponentValue('name', $event)"
          ></v-text-field>
          <v-textarea
            outlined
            label="Description"
            persistent-hint
            hint="A short description about the project to the users."
            :disabled="savingProjectDetails"
            :value="value.description"
            @input="updateComponentValue('description', $event)"
          ></v-textarea>
          <v-checkbox
            label="Randomize prompt order"
            persistent-hint
            hint="If enabled, users will be shown prompts in a random order instead of by date of creation."
            :disabled="savingProjectDetails"
            :input-value="value.randomize_prompt_order"
            @change="
              updateComponentValue(
                'randomize_prompt_order',
                $event ? $event : false
              )
            "
          >
          </v-checkbox>
          <v-checkbox
            label="Allow repeated sessions"
            persistent-hint
            hint="If enabled, users will be able to repeat the recording session after completing the project."
            :disabled="savingProjectDetails"
            :input-value="value.allow_repeated_sessions"
            @change="
              updateComponentValue(
                'allow_repeated_sessions',
                $event ? $event : false
              )
            "
          >
          </v-checkbox>
          <v-switch
            outlined
            label="Active"
            persistent-hint
            hint="If enabled, users will be able to see this project and can start recording. This can be turned on later after setting up the prompts."
            :disabled="savingProjectDetails"
            :input-value="value.active"
            @change="updateComponentValue('active', $event ? $event : false)"
          >
          </v-switch>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            text
            :disabled="savingProjectDetails"
            @click="setIsShown(false)"
            >Cancel</v-btn
          >
          <v-btn
            text
            :disabled="savingProjectDetails"
            type="submit"
            color="primary"
            >{{ submitButtonText }}</v-btn
          >
        </v-card-actions>
        <v-progress-linear
          indeterminate
          v-show="savingProjectDetails"
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
    savingProjectDetails: false,
  }),

  computed: {
    dialogTitle() {
      return this.value.project_id
        ? "Edit Project Details"
        : "Create New Project";
    },

    dialogSubtitle() {
      return this.value.project_id
        ? "Edit this speech data collection project's details."
        : "Create a new speech data collection project.";
    },

    submitButtonText() {
      return this.value.project_id ? "Save" : "Create";
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

    async saveProjectDetails() {
      this.savingProjectDetails = true;

      try {
        if (this.value.project_id) {
          await axios.put(`/projects/${this.value.project_id}`, this.value);
        } else {
          await axios.post("/projects", this.value);
        }

        this.showGlobalSnackbar("Project saved.");
        this.setIsShown(false);

        this.$emit("projectDetailsSaved");
      } catch (error) {
        this.showGlobalSnackbar(`Cannot save project. ${error}`);
      }

      this.savingProjectDetails = false;
    },
  },
};
</script>

<style></style>
