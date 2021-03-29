<template>
  <v-container fluid fill-height>
    <v-row>
      <v-spacer></v-spacer>
      <v-col align="center" justify="center">
        <v-card>
          <v-card-title>Login</v-card-title>
          <v-card-text>
            <form @submit.prevent="submitLoginForm">
              <v-container>
                <v-row>
                  <v-col
                    ><v-text-field
                      outlined
                      label="E-mail"
                      hint="The e-mail address you used to register an account on this site."
                      persistent-hint
                    ></v-text-field
                  ></v-col>
                </v-row>
                <v-row>
                  <v-col>
                    <v-text-field
                      outlined
                      type="password"
                      label="Password"
                      hint="The password you used to create an account on this site."
                      persistent-hint
                    ></v-text-field> </v-col
                ></v-row>
                <v-row
                  ><v-col align="right">
                    <v-btn color="primary" type="submit">Login</v-btn>
                  </v-col></v-row
                >
              </v-container>
            </form>
          </v-card-text>
        </v-card>
      </v-col>
      <v-spacer></v-spacer>
    </v-row>
  </v-container>
</template>

<script>
export default {
  methods: {
    submitLoginForm() {
      console.log("submitLoginForm");
    },
  },
};
</script>

<style></style>
