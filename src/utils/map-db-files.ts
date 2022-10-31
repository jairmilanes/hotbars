import { readFileSync } from "fs";
import glob from "glob";
import { Config } from "../lib/config";
import { SafeArray, SafeObject } from "../types";
import { logger } from "../lib/logger";
import { joinPath, pathSep } from "./path";


export const mapDatabaseFiles = (config: Config): SafeObject => {
  if (!config.fakeDb) {
    return {};
  }

  const paths = glob.sync(
    joinPath(config.source, config.fakeDb, '**', '*.json'),
    { nodir: true, cwd: config.root }
  );

  if (!paths.length) {
    logger.info(
      `-- No data under "${config.fakeDb}" were found, database generation aborted.`
    );
    return {};
  }

  const data: SafeObject = {};

  paths.map((path) => {
    const base = path.replace(joinPath(config.source, config.fakeDb as string, "/"), "");
    const table = base.indexOf(pathSep) > -1 ? base.split(pathSep)[0] : base.split('.')[0];
    const content = readFileSync(path, {encoding: config.encoding });
    const jsonData = JSON.parse(content.toString()) as SafeObject;

    if (base.indexOf(pathSep) > -1) {
      if (!Array.isArray(data[table])) {
        data[table] = [];
      }

      (data[table] as SafeArray).push(jsonData)
    } else {
      data[table] = jsonData;
    }
  });

  return data;
}
