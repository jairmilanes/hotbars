import { cosmiconfigSync, defaultLoaders } from "cosmiconfig";
import { logger } from "../../services";

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

export const loadFile = <T = any>(
  configName: string,
  dotFiles?: boolean,
  extensions?: string[],
  root = process.cwd()
): T | undefined => {
  try {
    const explorer = cosmiconfigSync(configName, {
      searchPlaces: resolveTargets(configName, extensions, dotFiles),
      stopDir: root,
      loaders: {
        '.dev': defaultLoaders['.json'],
        '.development': defaultLoaders['.json'],
        '.prod': defaultLoaders['.json'],
        '.production': defaultLoaders['.json'],
        noExt: defaultLoaders['.json']
      }
    });

    const result = explorer.search(root);

    if (result?.config) {
      return result.config;
    }
  } catch (error) {
    (logger.error || console.error)(error);
  }
};
