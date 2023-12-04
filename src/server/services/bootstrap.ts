/* eslint-disable @typescript-eslint/no-explicit-any */
import { logger } from "../../services";
import { Options, SafeObject, UserBootstrapCallback } from "../types";
import { joinPath } from "../utils";
import { Config } from "../core";
import { loadFile } from "./file-loader";

export class BootstrapData {
  private static data: Readonly<Record<string, any>> = Object.freeze({});

  static bootFile() {
    const config = Config.get<Options>();
    const extensions = [".js", ".cjs"];
    const bootstrapFile = joinPath(config.source, config.bootstrapName);
    logger.debug(`%p%P from %s`, 3, 0, bootstrapFile);
    const userBootstrapCallback = loadFile<UserBootstrapCallback>(
      bootstrapFile,
      false,
      extensions
    );

    if (userBootstrapCallback) {
      return userBootstrapCallback
    } else {
      logger.debug(`%p%P Could not load user bootstrap file.`, 3, 0);
    }
  }

  static async run() {
    logger.info(`%p%P Bootstraping user data`, 1, 1);

    const userBootstrapCallback = this.bootFile()

    if (typeof userBootstrapCallback === "function") {
      this.data = Object.freeze(await userBootstrapCallback(Config));
    } else {
      logger.debug(`%p%P Could not load user bootstrap file.`, 3, 0);
    }

    return this.data;
  }

  static get(): Readonly<SafeObject> {
    return this.data;
  }
}
