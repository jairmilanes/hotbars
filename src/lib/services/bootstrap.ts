import { SafeObject, UserBootstrapCallback } from "../../types";
import { joinPath, loadFile } from "../utils";
import { logger } from "./logger";
import { Config } from "../core";

export class BootstrapData {
  private static data: Readonly<SafeObject> = Object.freeze({});

  static async load() {
    const config = Config.get();
    const extensions = [".js", ".cjs"];
    const bootstrapFile = joinPath(config.source, config.bootstrapName);
    const userBootstrapCallback = loadFile<UserBootstrapCallback>(
      bootstrapFile,
      false,
      extensions
    );

    if (userBootstrapCallback && typeof userBootstrapCallback === "function") {
      logger.debug(`Bootstraping from ${bootstrapFile}...`);
      this.data = Object.freeze(await userBootstrapCallback(config));
    }

    return Object.freeze({});
  }

  static get(): Readonly<SafeObject> {
    return this.data;
  }
}
