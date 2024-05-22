import { JSONFileSync } from "lowdb/lib/node";
import lodashId from "lodash-id";
import { Config } from "../core";
import { JsonDb } from "../types";

export const createLowDb = (): JSONFileSync<JsonDb> => {
  // Configure lowdb to write to JSONFile
  const db = new JSONFileSync(Config.relPath("jsonDb"));

  // Read data from JSON file, this will set db.data content
  db.read();

  db._.mixin(lodashId);

  return db;
};
