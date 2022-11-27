/* eslint-disable @typescript-eslint/no-explicit-any */
import { existsSync, mkdirSync, writeFileSync } from "fs";
import glob from "glob";
import * as _ from "lodash";
import { logger } from "../services";
import { loadFile } from "../server/services";
import { Config } from "../server/core";
import { basename, dirname, joinPath } from "../server/utils";
import { generateRecords } from "./generate-records";
import { GeneratedData, SchemaConfig, SchemasPropsMap } from "./types";
import { parseOneToOne, parseOneToMany } from "./relations";
import { initHooks } from "./hooks";
import { parseAllProps } from "./prop-parser";

const loadSchema = (path: string): SchemaConfig | undefined => {
  const schemaConfig: SchemaConfig | undefined = loadFile(path);

  if (!schemaConfig) {
    return;
  }

  const { size, schema } = schemaConfig;

  if (size && schema) {
    return schemaConfig;
  }
};

export const generateData = (schemasList: SchemaConfig[]): GeneratedData => {
  const props: SchemasPropsMap = {};
  const hooks = initHooks();

  let data: GeneratedData = {};

  data = _.reduce(
    schemasList,
    (data, schemaConfig) => {
      logger.log(
        `Schema %s, %s records...`,
        schemaConfig.name,
        schemaConfig.size
      );

      props[schemaConfig.name] = parseAllProps(schemaConfig);

      logger.debug(`%p%P props: %o`, 1, 1, _.keys(props[schemaConfig.name]));

      const records = {
        ...data,
        [schemaConfig.name]: generateRecords(
          schemaConfig,
          props[schemaConfig.name],
          hooks
        ),
      };

      logger.debug(
        `%p%P generated %s %s records.`,
        1,
        1,
        records[schemaConfig.name].length,
        schemaConfig.name
      );

      return records;
    },
    data
  );

  logger.debug(`%P`, 200);

  logger.info(`Relationships:`);

  data = _.reduce(
    schemasList,
    (data, schemaConfig) => {
      parseOneToOne(schemaConfig, props[schemaConfig.name], data);
      parseOneToMany(schemaConfig, props[schemaConfig.name], data);

      if (hooks.afterSchema) {
        return {
          ...data,
          [schemaConfig.name]: hooks.afterSchema(
            data[schemaConfig.name],
            schemaConfig,
            props[schemaConfig.name]
          ),
        };
      }

      return data;
    },
    data
  );

  return hooks.afterAll ? hooks.afterAll(data, schemasList, props) : data;
};

export const generateDb = (): void => {
  const schemaDir = Config.relGlobPath("jsonSchema", "{js,json}");
  const paths = glob.sync(schemaDir);

  logger.log("Begining schema mapping...");

  const data = generateData(
    _.map(
      _.filter(paths, (p) => !_.endsWith(p, "hooks.js")),
      (path, i) => {
        logger.info("%p %s %s", 1, i, path);
        return loadSchema(path) as SchemaConfig;
      }
    )
  );

  const jsonDb = basename(Config.get<string>("jsonDb"));
  const dbDirectory = dirname(Config.fullPath("jsonDb"));

  logger.info("Saving results to %s", joinPath(dbDirectory, jsonDb));

  if (!existsSync(dirname(dbDirectory))) {
    mkdirSync(dirname(dbDirectory));
  }

  writeFileSync(joinPath(dbDirectory, jsonDb), JSON.stringify(data, null, 4));

  logger.log("Fake data generated successfully!");
};
