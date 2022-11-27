/* eslint-disable @typescript-eslint/no-explicit-any */
import { logger } from "../../services";
import { SafeObject, UserBootstrapCallback } from "../types";
import { joinPath } from "../utils";
import { Config } from "../core";
import { loadFile } from "./file-loader";

export class BootstrapData {
  private static data: Readonly<Record<string, any>> = Object.freeze({});

  static async load() {
    logger.info(`%p%P User data`, 1, 1);

    const config = Config.get();
    const extensions = [".js", ".cjs"];
    const bootstrapFile = joinPath(config.source, config.bootstrapName);
    const userBootstrapCallback = loadFile<UserBootstrapCallback>(
      bootstrapFile,
      false,
      extensions
    );

    if (userBootstrapCallback && typeof userBootstrapCallback === "function") {
      logger.debug(`%p%P from %s`, 3, 0, bootstrapFile);
      this.data = Object.freeze(await userBootstrapCallback(config));
    } else {
      logger.debug(`%p%P file %s not found, skipping.`, 3, 0, bootstrapFile);
    }

    return this.data;
  }

  static get(): Readonly<SafeObject> {
    return this.data;
  }
}
