const path = require("path");
const { exit } = require("process");
const sqlite3 = require("sqlite3").verbose();
const DB_NAME = "database.db";
const DB_PATH = path.join(path.dirname(require.main.filename), DB_NAME);

let db = new sqlite3.Database(DB_PATH, sqlite3.OPEN_READWRITE, (err) => {
  if (err && err.code == "SQLITE_CANTOPEN") {
    db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.log("Getting error " + err);
        exit(1);
      }
      db.serialize(() => {
        db.exec(
          "CREATE TABLE keys (key TEXT, link TEXT, PRIMARY KEY(key))",
          (err) => {
            if (err) {
              console.error(err);
              exit(1);
            }
          }
        );
      });
    });
  }
});

async function addEntry({ entry, replace = false }) {
  return new Promise((resolve, reject) => {
    let { key, link } = entry;

    let insertStatement = replace
      ? `INSERT INTO keys VALUES (?, ?) ON DUPLICATE KEY UPDATE key=?, link=?`
      : "INSERT INTO keys VALUES (?, ?)";

    db.serialize(() => {
      const stmt = db.prepare(insertStatement);
      if (replace) {
        stmt.run(key, link, key, link, (err, res) => {
          if (err) reject(err);
          else resolve();
        });
      } else {
        stmt.run(key, link, (err, res) => {
          if (err) reject(err);
          else resolve();
        });
      }
      stmt.finalize();
    });
  });
}

async function deleteEntry(key) {
  return new Promise((resolve, reject) => {
    let deleteStatement = "DELETE FROM keys WHERE key=?";
    db.serialize(() => {
      const stmt = db.prepare(deleteStatement);
      stmt.run(key, (err, res) => {
        if (err) reject(err);
        else resolve();
      });
      stmt.finalize();
    });
  });
}

function searchEntry(key) {
  return new Promise((resolve, reject) => {
    let selectStatement = `SELECT * FROM keys WHERE key=? LIMIT 1`;
    let stmt = db.prepare(selectStatement);
    stmt.get(key, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
    stmt.finalize();
  });
}

async function close() {
  db.close();
}

function listEntries() {
  return new Promise((resolve, reject) => {
    db.each(
      "SELECT key AS id, link FROM keys",
      (err, row) => {
        if (err) reject(err);

        if (row) {
          console.log(row.id + " " + row.link);
        }
      },
      (err, n) => {
        if (err) reject(err);
        else resolve();
      }
    );
  });
}

module.exports = {
  addEntry,
  deleteEntry,
  searchEntry,
  listEntries,
  close,
};
