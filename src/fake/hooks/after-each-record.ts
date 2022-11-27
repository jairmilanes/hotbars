import { GeneratedEntry, PropsConfig, SchemaConfig } from "../types";
import { parsePropConfig } from "../prop-parser";
import { getMethod } from "../parsers";
import { split } from "../../utils";

export const afterEachRecord = (
  record: GeneratedEntry,
  schemaConfig: SchemaConfig,
  propsConfig: PropsConfig
): GeneratedEntry => {
  const { afterRecord } = schemaConfig.hooks || {};

  if (afterRecord) {
    afterRecord?.reduce((record, action: string) => {
      const config = parsePropConfig("afterRecord", action);
      const args = config.args.map((arg) => split(arg, ".")[0]);
      const fn = getMethod(config);

      if (fn) {
        return fn(record, ...args);
      }

      return record;
    }, record);
  }

  return record;
};
