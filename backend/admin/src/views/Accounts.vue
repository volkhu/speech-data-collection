<template>
  <v-container fluid>
    <v-row>
      <v-col>
        <v-card>
          <v-card-title
            >Accounts
            <v-spacer></v-spacer>
            <v-text-field
              single-line
              append-icon="mdi-magnify"
              label="Search accounts"
              v-model="accountsTableSearchQuery"
              class="shrink mr-2"
            ></v-text-field>
            <v-btn icon class="mb-2" @click="loadAccountsTableItems"
              ><v-icon>mdi-refresh</v-icon></v-btn
            ></v-card-title
          ><v-card-subtitle
            >Manage accounts that are allowed to access the admin dashboard. If
            admin access is enabled for an account, they can access the admin
            panel's features, except this account management page. Only
            superusers can manage accounts. To grant access to a new account,
            they must first sign in to this admin panel at least once before
            their e-mail will appear here.</v-card-subtitle
          >

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
                :disabled="!item.modifiable || item.is_superuser"
                @change="updateAccount(item)"
              ></v-switch>
            </template>
            <template v-slot:item.is_superuser="{ item }">
              <v-switch
                v-model="item.is_superuser"
                :disabled="!item.modifiable || !item.has_admin_access"
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
      { text: "E-mail", value: "email", sortable: false },
      { text: "Has Admin Access", value: "has_admin_access", sortable: false },
      { text: "Is Superuser", value: "is_superuser", sortable: false },
    ],
    accountsTableItems: [],
  }),

  methods: {
    ...mapActions(["showGlobalSnackbar"]),

    /**
     * Load the list of accounts from the back-end API.
     */
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

    /**
     * Update an account along with admin or superuser access
     * flags on server side too.
     */
    async updateAccount(item) {
      item.modifiable = false;

      try {
        await axios.put("/accounts", item);
      } catch (error) {
        this.showGlobalSnackbar(`Cannot update account. ${error}`);
        this.loadAccountsTableItems(); // reload correct data from server
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
