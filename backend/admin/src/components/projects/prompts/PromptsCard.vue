<template>
  <v-card>
    <v-card-title
      >Prompts
      <v-spacer></v-spacer>
      <v-btn color="primary" class="mr-2">
        BATCH UPLOAD PROMPTS
      </v-btn>
      <v-btn color="primary">
        NEW PROMPT
      </v-btn>
    </v-card-title>
    <v-card-text>
      <v-data-table
        :loading="isPromptsTableLoading"
        :headers="promptsTableHeaders"
        :items="promptsTableItems"
        :items-per-page="promptsTableItemsPerPage"
      >
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
          <v-btn icon>
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
          <v-btn icon>
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

export default {
  props: ["projectId"],

  data: () => ({
    isPromptsTableLoading: true,
    promptsTableHeaders: [
      { text: "ID", value: "prompt_id" },
      { text: "Description", value: "description" },
      { text: "Image", value: "image" },
      { text: "Custom Instructions", value: "instructions" },
      { text: "Created", value: "created_at" },
      { text: "Last Edited", value: "last_edited_at" },
      { text: "Actions", value: "actions", sortable: false, align: "center" },
    ],
    promptsTableItems: [],
    promptsTableItemsPerPage: 15,
  }),

  methods: {
    ...mapActions(["showGlobalSnackbar"]),

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

  mounted() {
    this.loadPromptsTableItems();
  },
};
</script>

<style></style>
