const pgp = require("pg-promise")();

const dbConfig = {
  host: process.env.POSTGRESQL_HOST || "localhost",
  port: process.env.POSTGRESQL_PORT || 5432,
  user: process.env.POSTGRESQL_USER || "speech_app",
  password: process.env.POSTGRESQL_PASSWORD || "speech_app",
  database: process.env.POSTGRESQL_DATABASE || "speech_app",
};
const db = pgp(dbConfig);

module.exports = db;
