import glob from "glob";
import * as _ from "lodash";
import { existsSync, readFileSync } from "fs";
import { Config, DashboardConfig } from "../core";
import { joinPath, slash } from "./path-helpers";
import { logger } from "../../services";
import { Language } from "../types";

const load = (path: string, languages: Language[]) => {
  return languages.reduce((data, lang) => {
    const base = joinPath(path, lang.code);

    if (!existsSync(base)) {
      return data;
    }

    const files = glob.sync(joinPath(base, "**", "*.json"));

    if (!_.has(data, lang.code)) {
      _.set(data, lang.code, {});
    }

    files.forEach((filePath) => {
      const rel = slash(filePath).replace(base, "");
      const parts = rel.split(/[/.]/).filter(Boolean);

      // remove the extension from the path
      parts.pop();

      // if (!name) return data;

      const content = readFileSync(filePath, { encoding: "utf-8" });

      // save to the full path of the original file
      _.set(data, [lang.code, ...parts], JSON.parse(content));
    });

    return data;
  }, {});
};

/**
 * Load data by language if language is enabled, otherwise
 * returns the data directory glob path.
 *
 * @param name
 */
export const loadData = (name: string): Record<string, any> | string => {
  if (!Config.enabled("language")) {
    return Config.fullGlobPath(name);
  }

  const languages = Config.get<Language[]>("language.options");

  logger.silly(`%p%P Loading data from "%s"`, 1, 1, Config.fullPath(name))

  return load(Config.fullPath(name), languages);
};

export const loadDashboardData = (
  name: string
): Record<string, any> | string => {
  const languages = DashboardConfig.get<Language[]>("language.options");
  return load(DashboardConfig.fullPath(name), languages);
};
