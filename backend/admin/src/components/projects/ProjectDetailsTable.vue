<template>
  <v-simple-table>
    <template v-slot:default>
      <tbody>
        <tr>
          <td>Name</td>
          <td>{{ projectDetails.name }}</td>
        </tr>
        <tr>
          <td>Description</td>
          <td>
            {{ projectDetails.description }}
          </td>
        </tr>
        <tr>
          <td>Randomize prompt order</td>
          <td>
            <v-simple-checkbox
              disabled
              :value="projectDetails.randomize_prompt_order"
            ></v-simple-checkbox>
          </td>
        </tr>
        <tr>
          <td>Allow repeated sessions</td>
          <td>
            <v-simple-checkbox
              disabled
              :value="projectDetails.allow_repeated_sessions"
            ></v-simple-checkbox>
          </td>
        </tr>
        <tr>
          <td>Active</td>
          <td>
            <v-simple-checkbox
              disabled
              :value="projectDetails.active"
            ></v-simple-checkbox>
          </td>
        </tr>
      </tbody>
    </template>
  </v-simple-table>
</template>

<script>
export default {
  props: ["projectDetails"],
};
</script>

<style></style>
