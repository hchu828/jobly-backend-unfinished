"use strict";

/** Database setup for jobly. */

const { Client } = require("pg");
const { getDatabaseUri } = require("./config");

const DB_URI = (process.env.NODE_ENV === "test")
  ? "jobly_test"
  : process.env.DATABASE_URL || "jobly";

const db = new Client({
  // connectionString: getDatabaseUri(),
  connectionString: DB_URI,
});

db.connect();

module.exports = db;
