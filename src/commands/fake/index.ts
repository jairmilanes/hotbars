/* eslint-disable @typescript-eslint/no-explicit-any */
import { existsSync, mkdirSync, writeFileSync } from "fs";
import glob from "glob";
import { logger } from "../../lib/services";
import { Config } from "../../lib/core";
import { basename, dirname, joinPath, loadFile } from "../../lib/utils";
import { generateRecords } from "./property-parser";
import { SchemaConfig } from "./types";
import { RelationParser } from "./relation-parser";
import { JoinParser } from "./join-parser";
import { afterAll } from "./post-generation";

const loadSchema = (path: string): SchemaConfig | undefined => {
  const schemaConfig: SchemaConfig | undefined = loadFile(path);

  if (!schemaConfig) {
    return;
  }

  logger.debug("---- schemaConfig:", schemaConfig);

  const { size, schema } = schemaConfig;

  logger.debug(`---- will generate ${size} ${schemaConfig.name} entries...`);

  if (size && schema) {
    return schemaConfig;
  }
};

export const generate = () => {
  const schemaDir = Config.relGlobPath("dbSchema", "json");
  const paths = glob.sync(schemaDir);
  const schemas = {} as any;
  const data = {} as any;

  logger.info("Begining schema mapping...");
  logger.debug("-- schemas", paths);

  paths.forEach((path) => {
    logger.info("---- loading:", path);
    const schemaConfig = loadSchema(path);

    if (schemaConfig) {
      schemas[schemaConfig.name] = schemaConfig;
      data[schemaConfig.name] = generateRecords(
        schemaConfig,
        schemaConfig.size
      );
    }
  });

  Object.keys(schemas).map((schemaName) => {
    const relationParser = new RelationParser(data, schemas[schemaName]);
    const joinParser = new JoinParser(data, schemas[schemaName]);

    relationParser.generate();
    joinParser.generate();

    data[schemaName] = afterAll(data[schemaName], schemas[schemaName]);
  });

  const jsonDb = basename(Config.get<string>("jsonDb"));
  const dbDirectory = dirname(Config.fullPath("jsonDb"));

  if (!existsSync(dirname(dbDirectory))) {
    mkdirSync(dirname(dbDirectory));
  }

  writeFileSync(joinPath(dbDirectory, jsonDb), JSON.stringify(data, null, 4));
};
