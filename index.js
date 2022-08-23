#! /usr/bin/env node

const open = require("open");
const { keypress } = require("./utils/misc");
const {
  close,
  addEntry,
  deleteEntry,
  searchEntry,
  listEntries,
} = require("./utils/db");

async function main() {
  let [mode, key, link] = process.argv.slice(2);

  switch (mode) {
    case "open":
      if (!key) {
        console.log("No Passed Key");
        await keypress();
        await close();
        process.exit(0);
      }
      let entry = await searchEntry(key);
      if (entry) {
        let { link } = entry;
        await open(link);
      } else {
        console.log("No Entry Found");
        await keypress();
        await close();
        process.exit(0);
      }
      break;
    case "add":
      if (!key || !link) {
        console.log(
          `${!key ? "No Key Passed" : ""} ${!link ? "No Link Passed" : ""}`
        );
        await keypress();
        await close();
        process.exit(0);
      }
      await addEntry({ entry: { key, link } });
      break;
    case "delete":
      if (!key) {
        console.log("No Passed Key");
        await keypress();
        await close();
        process.exit(0);
      }
      await deleteEntry(key);
      break;
    case "list":
      await listEntries();
      await close();
      console.log("=============END===============");
      await keypress();
      process.exit(0);
    default:
      console.log(`${mode} is not supported`);
      await keypress();
      await close();
      process.exit(0);
  }
  await close();
}

main();
