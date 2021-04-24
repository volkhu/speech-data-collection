<template>
  <v-simple-table>
    <template v-slot:default>
      <tbody>
        <tr>
          <td>Project ID</td>
          <td>{{ projectDetails.project_id }}</td>
        </tr>
        <tr>
          <td>Created</td>
          <td>
            {{ formatDateTime(projectDetails.created_at) }} ({{
              projectDetails.created_by
            }})
          </td>
        </tr>
        <tr>
          <td>Edited</td>
          <td>
            {{ formatDateTime(projectDetails.last_edited_at) }} ({{
              projectDetails.last_edited_by
            }})
          </td>
        </tr>
        <tr>
          <td>Prompts</td>
          <td>{{ projectDetails.num_prompts }}</td>
        </tr>
        <tr>
          <td>Participants</td>
          <td>{{ projectDetails.num_participants }}</td>
        </tr>
        <tr>
          <td>Sessions</td>
          <td>{{ projectDetails.num_sessions }}</td>
        </tr>
        <tr>
          <td>Recordings</td>
          <td>
            {{ projectDetails.num_recordings }} ({{
              formatSeconds(projectDetails.total_recordings_duration)
            }}
            seconds in total)
          </td>
        </tr>
      </tbody>
    </template>
  </v-simple-table>
</template>

<script>
import datetime from "@/mixins/datetime";

export default {
  props: ["projectDetails"],

  mixins: [datetime],
};
</script>

<style></style>
