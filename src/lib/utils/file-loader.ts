import { cosmiconfigSync } from "cosmiconfig";
import { SafeObject } from "../../types";
import { logger } from "../services";

const resolveTargets = (
  fileName: string,
  extensions?: string[],
  dotFiles?: boolean
) => {
  const resolvedExtensions = extensions || ["", ".json", ".js", ".cjs"];

  return resolvedExtensions.reduce<string[]>((files, extension) => {
    files.push(fileName.concat(extension));

    if (dotFiles) {
      files.push(".".concat(fileName, extension));
    }

    return files;
  }, []);
};

export const loadFile = <T = SafeObject>(
  configName: string,
  dotFiles?: boolean,
  extensions?: string[]
): T | undefined => {
  try {
    const explorer = cosmiconfigSync(configName, {
      searchPlaces: resolveTargets(configName, extensions, dotFiles),
      stopDir: process.cwd(),
    });

    const result = explorer.search();

    if (result?.config) {
      return result.config;
    }
  } catch (error) {
    logger.error(error);
  }
};
