import { loadFile } from "../../server/services";
import { Config } from "../../server/core";
import { HookModule, HooksConfig } from "../types";
// import { afterEachRecord } from "./after-each-record"
// import { afterEachSchema } from "./after-each-schema"
// import { afterAll } from "./after-all"

export const initHooks = (): HooksConfig => {
  const hooks: HookModule | undefined = loadFile<HookModule>(
    [Config.relPath("jsonSchema"), "hooks.js"].join("/")
  );

  return {
    afterRecord: hooks?.afterRecord, // || afterEachRecord,
    afterSchema: hooks?.afterSchema, // || afterEachSchema,
    afterAll: hooks?.afterAll, // || afterAll
  };
};
