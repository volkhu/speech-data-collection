<template>
  <v-dialog max-width="512px" :value="isShown" @input="setIsShown($event)">
    <v-card>
      <v-card-title>Are you sure you want to delete this prompt?</v-card-title>
      <v-card-subtitle class="pt-2">
        Existing recordings associated with this prompt will be
        unaffected.</v-card-subtitle
      >
      <v-card-text>
        <v-simple-table>
          <tbody>
            <tr>
              <td width="5%">ID:</td>
              <td>{{ promptDetails.prompt_id }}</td>
            </tr>
            <tr>
              <td>Description:</td>
              <td>{{ promptDetails.description }}</td>
            </tr>
          </tbody>
        </v-simple-table>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text @click="setIsShown(false)" :disabled="deletingPrompt"
          >Cancel</v-btn
        >
        <v-btn text @click="deletePrompt" :disabled="deletingPrompt"
          >Confirm</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import axios from "axios";
import { mapActions } from "vuex";

export default {
  props: ["isShown", "promptDetails"],

  data: () => ({
    deletingPrompt: false,
  }),

  methods: {
    ...mapActions(["showGlobalSnackbar"]),

    setIsShown(value) {
      this.$emit("update:isShown", value);
    },

    async deletePrompt() {
      this.deletingPrompt = true;

      try {
        await axios.delete(`/prompts/${this.promptDetails.prompt_id}`);
        this.$emit("promptDeleted");
        this.setIsShown(false);

        this.showGlobalSnackbar("Prompt deleted.");
      } catch (error) {
        this.showGlobalSnackbar(`Cannot delete prompt. ${error}`);
      }

      this.deletingPrompt = false;
    },
  },
};
</script>

<style></style>
