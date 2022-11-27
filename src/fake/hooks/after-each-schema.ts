import { GeneratedEntry, PropsConfig, SchemaConfig } from "../types";
import { parsePropConfig } from "../prop-parser";
import { split } from "../../utils";
import { getMethod } from "../parsers";

export const afterEachSchema = (
  entries: GeneratedEntry[],
  schemaConfig: SchemaConfig,
  propsConfig: PropsConfig
): GeneratedEntry[] => {
  const { afterSchema } = schemaConfig.hooks || {};

  if (afterSchema) {
    return afterSchema?.reduce((entries, action: string) => {
      const config = parsePropConfig("afterRecord", action);
      const args = config.args.map((arg) => split(arg, ".")[0]);
      const fn = getMethod(config);

      if (fn) {
        return entries.map((entry) => fn(entry, ...args));
      }

      return entries;
    }, entries);
  }

  return entries;
};
