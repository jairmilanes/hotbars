/* eslint-disable @typescript-eslint/no-explicit-any */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
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
import { readJson, readJsonSync } from "fs-extra";

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

      logger.debug(`%p%P Required values %o`, 1, 1, _.keys(props[schemaConfig.name]));

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

export const generateDb = (schemaName?: string, overwrite = false): void => {
  const schemaDir = Config.relGlobPath("jsonSchema");
  const paths = glob
    .sync(schemaDir)
    .filter((path) =>
      !schemaName || (schemaName && path.endsWith(`${schemaName}.json`))
    );

  logger.log("Begining schema mapping...");
  logger.debug("%p%P Source path %s", 1, 1, schemaDir);

  const data = generateData(
    _.map(
      _.filter(paths, (p) => !_.endsWith(p, "hooks.js")),
      (path, i) => {
        logger.silly("%p %s %s", 1, i, path);
        return loadSchema(path) as SchemaConfig;
      }
    )
  );

  const jsonDb = basename(Config.get<string>("jsonDb"));
  const dbDirectory = dirname(Config.fullPath("jsonDb"));

  logger.info("Saving results to %s", joinPath(dbDirectory, jsonDb));

  if (!existsSync(dirname(dbDirectory))) {
    logger.info("-- Create dir", dirname(dbDirectory))
    mkdirSync(dirname(dbDirectory));
  }

  if (overwrite) {
    logger.info("Overwriting", joinPath(dbDirectory, jsonDb))
    writeFileSync(joinPath(dbDirectory, jsonDb), JSON.stringify(data, null, 4));
  } else {
    logger.info("Merging", joinPath(dbDirectory, jsonDb))
    const currentData: any = readJsonSync(joinPath(dbDirectory, jsonDb))

    // logger.info("-- Current data", Object.keys(currentData))

    const tables = Object.keys(data)

    // logger.info("-- NEW data", Object.keys(data))

    for( let i = 0; i < tables.length; i++) {
      currentData[tables[i]] = data[tables[i]]
    }

    writeFileSync(joinPath(dbDirectory, jsonDb), JSON.stringify(currentData, null, 4));
  }

  logger.log("Fake data generated successfully!");
};
