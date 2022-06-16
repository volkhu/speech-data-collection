# Speech Data Collection
This is a set of tools for building speech corpora. Users can record speech samples in an Android app according to instructions that are managed from a web-based admin dashboard. Completed recordings are uploaded automatically and accessible from the dashboard.

There are 3 main components:
* **Android App** - native app written in Kotlin, distributed to end-users to record audio samples
* **Admin Dashboard** - Vue/Vuetify single-page application for managing contents of the app and uploaded recordings
* **Back-end** - Node/Express/Postgres based REST API to serve both the app and the dashboard

Further details are available at https://digikogu.taltech.ee/et/Item/cb25a4f4-2243-4766-bd78-e6fccad12b18 (in Estonian).
