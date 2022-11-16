/* eslint-disable @typescript-eslint/no-explicit-any */
import { existsSync, mkdirSync, writeFileSync } from "fs";
import glob from "glob";
import { logger } from "../../lib/services";
import { Config } from "../../lib/core";
import { joinPath, loadFile } from "../../lib/utils";
import { generateRecords } from "./property-parser";
import { SchemaConfig } from "./types";
import { RelationParser } from "./relation-parser";
import { JoinParser } from "./join-parser";

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
        schemaConfig.schema,
        schemaConfig.size
      );
    }
  });

  Object.keys(schemas).map((schemaName) => {
    const relationParser = new RelationParser(data, schemas[schemaName]);
    const joinParser = new JoinParser(data, schemas[schemaName]);

    relationParser.generate();
    joinParser.generate();
  });

  const dest = Config.fullPath("jsonDb");

  if (!existsSync(dest)) {
    mkdirSync(dest);
  }

  writeFileSync(joinPath(dest, "db.json"), JSON.stringify(data, null, 4));
};
