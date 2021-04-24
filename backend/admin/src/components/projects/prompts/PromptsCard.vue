<template>
  <v-card>
    <!-- Delete prompt confirmation dialog -->
    <delete-prompt-dialog
      :promptDetails="deletedPromptDetails"
      :isShown="isDeletePromptDialogShown"
      @update:isShown="isDeletePromptDialogShown = $event"
      @promptDeleted="onPromptsChanged"
    />

    <!-- Batch upload prompts dialog -->
    <batch-upload-prompts-dialog
      :projectId="projectId"
      :isShown="isBatchUploadPromptsDialogShown"
      @update:isShown="isBatchUploadPromptsDialogShown = $event"
      @batchPromptsUploaded="onPromptsChanged"
    />

    <!-- New/edit prompt dialog -->
    <new-edit-prompt-dialog
      :isShown="isNewEditPromptDialogShown"
      @update:isShown="isNewEditPromptDialogShown = $event"
      v-model="newEditedPromptDetails"
      @promptSaved="onPromptsChanged"
    />

    <v-card-title
      >Prompts
      <v-spacer></v-spacer>
      <v-text-field
        single-line
        append-icon="mdi-magnify"
        label="Search prompts"
        v-model="promptsTableSearchQuery"
        class="mr-1 mt-2 shrink"
      ></v-text-field>
      <v-btn icon class="mr-2" @click="onPromptsChanged"
        ><v-icon>mdi-refresh</v-icon></v-btn
      >
      <v-btn color="primary" class="mr-2" @click="openBatchUploadPromptsDialog">
        BATCH UPLOAD PROMPTS
      </v-btn>
      <v-btn color="primary" @click="openNewPromptDialog">
        NEW PROMPT
      </v-btn>
    </v-card-title>
    <v-card-text>
      <v-data-table
        :loading="isPromptsTableLoading"
        :search="promptsTableSearchQuery"
        :headers="promptsTableHeaders"
        :items="promptsTableItems"
        :items-per-page="promptsTableItemsPerPage"
      >
        <template v-slot:item.thumbnail_data="{ item }">
          <v-img
            v-if="item.thumbnail_data"
            contain
            max-height="50"
            max-width="200"
            :src="item.thumbnail_data"
          ></v-img>
        </template>
        <template v-slot:item.created_at="{ item }">
          {{ formatDateTime(item.created_at) }}<br />({{ item.created_by }})
        </template>
        <template v-slot:item.last_edited_at="{ item }">
          {{ formatDateTime(item.last_edited_at) }}<br />({{
            item.last_edited_by
          }})
        </template>
        <template v-slot:item.actions="{ item }">
          <v-btn icon @click="openEditPromptDialog(item)">
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
          <v-btn icon @click="openDeletePromptDialog(item)">
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </template>
      </v-data-table>
    </v-card-text>
  </v-card>
</template>

<script>
import axios from "axios";
import { mapActions } from "vuex";
import DeletePromptDialog from "./DeletePromptDialog";
import BatchUploadPromptsDialog from "./BatchUploadPromptsDialog";
import NewEditPromptDialog from "./NewEditPromptDialog.vue";
import datetime from "@/mixins/datetime";

export default {
  props: ["projectId"],

  data: () => ({
    // prompts table
    isPromptsTableLoading: true,
    promptsTableSearchQuery: "",
    promptsTableHeaders: [
      { text: "ID", value: "prompt_id" },
      { text: "Prompt Text (optional)", value: "description" },
      { text: "Custom Instructions (optional)", value: "instructions" },
      { text: "Image (optional)", value: "thumbnail_data", align: "center" },
      { text: "Created", value: "created_at" },
      { text: "Edited", value: "last_edited_at" },
      { text: "Actions", value: "actions", sortable: false, align: "center" },
    ],
    promptsTableItems: [],
    promptsTableItemsPerPage: 15,

    // delete prompt dialog
    isDeletePromptDialogShown: false,
    deletedPromptDetails: {},

    // batch upload prompts dialog
    isBatchUploadPromptsDialogShown: false,

    // new/edit prompt dialog
    isNewEditPromptDialogShown: false,
    newEditedPromptDetails: {},
  }),

  components: {
    DeletePromptDialog,
    BatchUploadPromptsDialog,
    NewEditPromptDialog,
  },

  methods: {
    ...mapActions(["showGlobalSnackbar"]),

    openDeletePromptDialog(item) {
      this.deletedPromptDetails = JSON.parse(JSON.stringify(item));
      this.isDeletePromptDialogShown = true;
    },

    openBatchUploadPromptsDialog() {
      this.isBatchUploadPromptsDialogShown = true;
    },

    openNewPromptDialog() {
      this.newEditedPromptDetails = { project_id: this.projectId };
      this.isNewEditPromptDialogShown = true;
    },

    openEditPromptDialog(item) {
      this.newEditedPromptDetails = { prompt_id: item.prompt_id };
      this.isNewEditPromptDialogShown = true;
    },

    onPromptsChanged() {
      this.loadPromptsTableItems();
      this.$emit("promptsChanged");
    },

    async loadPromptsTableItems() {
      this.isPromptsTableLoading = true;

      try {
        const promptsResponse = await axios.get(
          `/projects/${this.projectId}/prompts`
        );
        this.promptsTableItems = promptsResponse.data;
      } catch (error) {
        this.showGlobalSnackbar(`Cannot load prompts. ${error}`);
      }

      this.isPromptsTableLoading = false;
    },
  },

  mixins: [datetime],

  mounted() {
    this.loadPromptsTableItems();
  },
};
</script>

<style></style>
