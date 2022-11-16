import { GeneratedEntry, PostGenAction, SchemaConfig } from "./types";
import { omit } from "lodash";


export const afterEach = (record: GeneratedEntry, schemaConfig: SchemaConfig) => {
  const { afterEach } = schemaConfig;

  if (afterEach) {
    afterEach.forEach((action: PostGenAction) => {
      if (action.type === "removeProps") {
        record = omit(record, action.value as string[]);
      }
    })
  }

  return record;
}

export const afterAll = (records: GeneratedEntry[], schemaConfig: SchemaConfig) => {
  const { afterAll } = schemaConfig;

  return records.map((record, i) => {
    if (afterAll) {
      afterAll.forEach((action: PostGenAction) => {
        if (action.type === "removeProps") {
          record = omit(record, action.value as string[]);
        }
      })
    }

    return record;
  });
}