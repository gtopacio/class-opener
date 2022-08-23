require("dotenv").config();
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database(
  path.join(path.dirname(require.main.filename), process.env.DB_NAME),
  sqlite3.OPEN_READWRITE
);


