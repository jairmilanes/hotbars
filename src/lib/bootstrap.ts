import { Config, loadConfig } from "./config";
import { SafeObject, UserBootstrapCallback } from "../types";
import { joinPath } from "../utils/path";
import { logger } from "./logger";


export const bootstrap = async (config: Config): Promise<SafeObject> => {
  const bootstrapFile = joinPath(config.source, config.bootstrapName);

  const userBootstrapCallback = loadConfig<UserBootstrapCallback>(
    bootstrapFile,
    config.moduleName
  );

  if (userBootstrapCallback && typeof userBootstrapCallback === "function") {
    logger.debug(`Bootstraping...`);
    return userBootstrapCallback(config);
  } else {
    logger.debug(`No bootstrap file named ${bootstrapFile} was found, skipping...`);
  }

  return {};
};