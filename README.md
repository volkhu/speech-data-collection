# Speech Data Collection
This is a set of tools for building speech corpora. Users can record speech samples in an Android app according to instructions that are managed from a web-based admin dashboard. Completed recordings are uploaded automatically and accessible from the dashboard.

There are 3 main components:
* **Android App** - native app written in Kotlin, distributed to end-users to record audio samples
* **Admin Dashboard** - Vue/Vuetify single-page application for managing contents of the app and uploaded recordings
* **Back-end** - Node/Express/Postgres based REST API to serve both the app and the dashboard

## Repository structure
Some of the more important folders are:
* `/app/` - Android app project
* `/app/src/main/java/.../speechdatacollection/` - app main activity and startup logic
* `/app/src/main/java/.../speechdatacollection/fragments/` - sub-views to the main activity
* `/app/src/main/java/.../speechdatacollection/network/` - service to call back-end with data structures
* `/backend/admin/` - admin dashboard Vue project
* `/backend/admin/src/views/` - Vue components for dashboard views (pages)
* `/backend/admin/src/components/` - subcomponents for views
* `/backend/server/` - back-end server Node project
* `/backend/server/public/` - static HTML/CSS page for providing app download
* `/backend/server/src/db/` - file storage and database services
* `/backend/server/src/db/sql/` - database schema and queries
* `/backend/server/src/routes/api/` - REST API routes
* `/backend/server/src/middleware/` - oauth2 authentication for API calls

Further details are available at https://digikogu.taltech.ee/en/Item/cb25a4f4-2243-4766-bd78-e6fccad12b18 (in Estonian).
