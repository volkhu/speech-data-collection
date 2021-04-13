<template>
  <v-container fluid>
    <v-row>
      <v-col>
        <v-card>
          <v-row no-gutters>
            <v-col
              ><v-card-title>Accounts</v-card-title
              ><v-card-subtitle
                >Manage accounts that are allowed to access the admin
                dashboard.</v-card-subtitle
              ></v-col
            >
            <v-spacer></v-spacer>
            <v-col cols="auto" class="mr-2">
              <v-text-field
                single-line
                append-icon="mdi-magnify"
                label="Search accounts"
                v-model="accountsTableSearchQuery"
              ></v-text-field>
            </v-col>
          </v-row>

          <!-- Accounts table -->
          <v-data-table
            :headers="accountsTableHeaders"
            :items="accountsTableItems"
            :search="accountsTableSearchQuery"
            v-bind:loading="isAccountsTableLoading"
          >
            <template v-slot:item.has_admin_access="{ item }">
              <v-switch
                v-model="item.has_admin_access"
                :disabled="!item.modifiable"
                @change="updateAccount(item)"
              ></v-switch>
            </template>
            <template v-slot:item.is_superuser="{ item }">
              <v-switch
                v-model="item.is_superuser"
                :disabled="!item.modifiable"
                @change="updateAccount(item)"
              ></v-switch>
            </template>
          </v-data-table>
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
    // accounts table
    isAccountsTableLoading: true,
    accountsTableSearchQuery: "",
    accountsTableHeaders: [
      { text: "E-mail", value: "email", align: "start" },
      { text: "Has Admin Access", value: "has_admin_access" },
      { text: "Is Superuser", value: "is_superuser" },
    ],
    accountsTableItems: [],

    // change admin access confirmation dialog
    isChangeAdminAccessDialogShown: false,
  }),

  methods: {
    ...mapActions(["showGlobalSnackbar"]),

    async loadAccountsTableItems() {
      this.isAccountsTableLoading = true;

      try {
        const accountsResponse = await axios.get("/accounts");
        this.accountsTableItems = accountsResponse.data;
      } catch (error) {
        this.showGlobalSnackbar(`Cannot load accounts. ${error}`);
      }

      this.isAccountsTableLoading = false;
    },

    // update admin or superuser access flags on server side too
    async updateAccount(item) {
      item.modifiable = false;

      try {
        await axios.put("/accounts", item);
      } catch (error) {
        this.showGlobalSnackbar(`Cannot update account. ${error}`);
        this.loadAccountsTableItems();
      }

      item.modifiable = true;
    },
  },

  created() {
    this.loadAccountsTableItems();
  },
};
</script>

<style></style>
