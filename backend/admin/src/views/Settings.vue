<template>
  <v-container fluid>
    <v-row>
      <v-col>
        <v-card>
          <v-card-title
            >Settings
            <v-spacer></v-spacer>
            <v-btn icon class="mr-2" @click="loadSettings"
              ><v-icon>mdi-refresh</v-icon></v-btn
            > </v-card-title
          ><v-card-subtitle
            >Manage general settings of the accompanying Speech App mobile
            application.</v-card-subtitle
          >
          <v-card-text>
            <v-textarea
              :disabled="!settingsLoaded"
              outlined
              label="Mobile App Terms"
              persistent-hint
              hint="These terms will be shown to the users when the mobile app is first opened. Users have to agree to these before they can continue using the app."
              v-model="settings.mobile_app_terms"
            ></v-textarea>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="primary"
              class="mr-2 mb-2"
              :disabled="!settingsLoaded"
              @click="saveSettings"
            >
              SAVE SETTINGS
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapActions } from "vuex";
import axios from "axios";

export default {
  data: () => ({
    settingsLoaded: false,
    settings: {
      mobile_app_terms: "",
    },
  }),

  methods: {
    ...mapActions(["showGlobalSnackbar"]),

    async loadSettings() {
      try {
        const settingsResponse = await axios.get("/settings");
        this.settings = settingsResponse.data;
        this.settingsLoaded = true;
      } catch (error) {
        this.showGlobalSnackbar(`Cannot load settings. ${error}`);
      }
    },

    async saveSettings() {
      try {
        const settingsResponse = await axios.put("/settings", this.settings);
        this.showGlobalSnackbar("Settings saved.");
      } catch (error) {
        this.showGlobalSnackbar(`Cannot save settings. ${error}`);
      }
    },
  },

  mounted() {
    this.loadSettings();
  },
};
</script>

<style></style>
