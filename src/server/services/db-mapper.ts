import { readFileSync } from "fs";
import glob from "glob";
import { logger } from "../../services";
import { Options, SafeArray, SafeObject } from "../types";
import { joinPath, pathSep } from "../utils";

export const mapDatabase = (config: Options): any => {
  const { root, source, jsonDb, encoding } = config;

  if (!jsonDb) {
    return {};
  }

  const paths = glob.sync(joinPath(source, jsonDb, "**", "*.json"), {
    nodir: true,
    cwd: root,
  });

  if (!paths.length) {
    logger.info(
      `-- No data under "${jsonDb}" were found, database generation aborted.`
    );
    return {};
  }

  const data: SafeObject = {};

  paths.map((path) => {
    const base = path.replace(joinPath(source, jsonDb as string, "/"), "");
    const table =
      base.indexOf(pathSep) > -1 ? base.split(pathSep)[0] : base.split(".")[0];
    const content = readFileSync(path, { encoding: encoding });
    const jsonData = JSON.parse(content.toString()) as SafeObject;

    if (base.indexOf(pathSep) > -1) {
      if (!Array.isArray(data[table])) {
        data[table] = [];
      }

      (data[table] as SafeArray).push(jsonData);
    } else {
      data[table] = jsonData;
    }
  });

  return data;
};
