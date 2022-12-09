/* eslint-disable @typescript-eslint/no-explicit-any */
import * as _ from "lodash";
import { logger } from "../services";
import {
  PropConfig,
  GeneratedEntry,
  SchemaConfig,
  PropsConfig,
  HooksConfig,
} from "./types";
import {
  resetUniqueCallbacks,
  parseArgs,
  parseElementArray,
  parseHelper,
  parseUse,
} from "./parsers";
import { Config } from "../server/core";
import { parseMapped } from "./parsers/mapped";

export const generateProp = (
  entry: GeneratedEntry,
  config: PropConfig,
  schemaConfig: SchemaConfig
) => {
  const { module } = config;

  if (_.includes(["one-to-one", "one-to-many"], module)) {
    return entry;
  }

  return _.flow([
    parseArgs,
    parseUse,
    parseMapped,
    parseElementArray,
    parseHelper,
    _.partialRight(_.get, "entry"),
  ])({ entry, config, schemaConfig });
};

export const generateRecords = (
  schemaConfig: SchemaConfig,
  propsConfig: PropsConfig,
  hooks: HooksConfig
): GeneratedEntry[] => {
  resetUniqueCallbacks();

  const { schema } = schemaConfig;
  const props = _.filter(_.keys(schema), (p) => _.isString(schema[p]));

  const verbose = Config.get("verbose");

  const entries: GeneratedEntry[] = _.map(
    _.range(schemaConfig.size),
    (i: number): GeneratedEntry => {
      if (!verbose && i === 0) logger.update(1);

      const entry: GeneratedEntry = _.reduce(
        props,
        (entry, prop) => {
          logger.debug(`%p%P %s:`, 3, 0, prop);
          const updated = generateProp(
            entry,
            _.cloneDeep(propsConfig[prop]),
            schemaConfig
          );
          logger.debug(
            `%p%P ${
              propsConfig[prop].module ? `${propsConfig[prop].module}.` : ""
            }${propsConfig[prop].method} => ${_.truncate(
              (updated as any)[prop]
            )}`,
            5,
            1
          );
          return updated;
        },
        {}
      );

      if (!verbose && i === 0) logger.update(2);
      return hooks.afterRecord
        ? hooks.afterRecord(entry, schemaConfig, propsConfig)
        : entry;
    }
  );

  logger.update(1);

  return entries;
};
