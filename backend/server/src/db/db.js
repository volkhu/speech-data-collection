const fs = require("fs");
const path = require("path");
const pgPromise = require("pg-promise");

// init pg-promise
const queryDir = path.join(__dirname, "./sql/queries");
const alwaysReloadQueries = false;
const loadedQueries = {};
const pgpConfig = {
  extend(obj, dc) {
    // add a function to db object to easily retrieve query files
    obj.getQuery = (queryName) => {
      if (!loadedQueries[queryName] || alwaysReloadQueries) {
        const queryPath = path.join(queryDir, queryName + ".sql");
        loadedQueries[queryName] = fs.readFileSync(queryPath).toString();
      }

      return loadedQueries[queryName];
    };
  },
};
const pgp = pgPromise(pgpConfig);

// init db
const dbConfig = {
  host: process.env.POSTGRESQL_HOST || "localhost",
  port: process.env.POSTGRESQL_PORT || 5432,
  user: process.env.POSTGRESQL_USER || "speech_app",
  password: process.env.POSTGRESQL_PASSWORD || "speech_app",
  database: process.env.POSTGRESQL_DATABASE || "speech_app",
};
const db = pgp(dbConfig);

module.exports = db;
