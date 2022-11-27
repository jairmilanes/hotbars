import low, { LowdbSync } from "lowdb";
import FileSync from "lowdb/adapters/FileSync";
import lodashId from "lodash-id";
import { Config } from "../core";
import { JsonDb } from "../types";

export const createLowDb = (): LowdbSync<JsonDb> => {
  // Configure lowdb to write to JSONFile
  const db = low(new FileSync(Config.relPath("jsonDb")));

  // Read data from JSON file, this will set db.data content
  db.read();

  db._.mixin(lodashId);

  return db;
};
