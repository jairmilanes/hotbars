import glob from "glob";
import * as _ from "lodash";
import { existsSync, readFileSync } from "fs";
import { Config } from "../core";
import { joinPath, slash } from "./path-helpers";

/**
 * Load data by language if language is enabled, otherwise
 * returns the data directory glob path.
 *
 * @param name
 * @param ext
 */
export const loadData = (
  name: string,
  ext?: string
): Record<string, any> | string => {
  if (!Config.enabled("language") && !_.startsWith(name, "server")) {
    return Config.fullGlobPath(name, ext);
  }

  const languages = Config.get<string[]>("language.languages");

  if (_.startsWith(name, "server")) {
    languages.push("en");
  }

  return languages.reduce((data, lang) => {
    const base = joinPath(Config.fullPath(name), lang);

    if (!existsSync(base)) {
      return data;
    }

    const files = glob.sync(Config.globPath(base, ext));

    if (!_.has(data, lang)) {
      _.set(data, lang, {});
    }

    files.forEach((filePath) => {
      const rel = slash(filePath).replace(base, "");
      const parts = rel.split(/[/.]/).filter(Boolean);

      // remove the extension from the path
      parts.pop();

      if (!name) return data;

      const content = readFileSync(filePath, { encoding: "utf-8" });

      // save to the full path of the original file
      _.set(data, [lang, ...parts], JSON.parse(content));
    });

    return data;
  }, {});
};
