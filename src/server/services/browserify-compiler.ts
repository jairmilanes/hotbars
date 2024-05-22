import { createReadStream, createWriteStream, readFileSync, writeFileSync } from "fs";
import compiler from "browserify";
import uglify from "uglify-js";
import { logger } from "../../services";
import { Config, DashboardConfig, EventManager, ServerEvent } from "../core";
import { Env, WatcherChange } from "../types";
import { joinPath } from "../utils";
import { getServerFilePath } from "../utils/get-server-data-dir";

export class BrowserifyCompiler {

  static create(): void {
    logger.debug(`Runtime compiler`);
    EventManager.i.on(
      ServerEvent.USER_RUNTIME_CHANGED,
      this.compileUserRuntime
    );
    EventManager.i.on(
      ServerEvent.DASHBOARD_RUNTIME_CHANGED,
      this.compileDashboardRuntime
    );
  }

  static compileDashboardRuntime(data?: WatcherChange): Promise<void> {

    const runtime = DashboardConfig.fullPath(
      "public",
      "bundles",
      "dashboard.runtime.js"
    );
    const result = DashboardConfig.fullPath("public", "bundles", "dashboard.bundle.js")
    logger.debug(`%p%P --> %s`, -1, -1, runtime);
    logger.debug(`%p%P <-- %s`, -1, -1, result);
    const writeStream = createWriteStream(result);

    return new Promise((resolve) => {
      compiler()
        .add(runtime)
        .ignore("Handlebars")
        .external("Handlebars")
        .bundle()
        .pipe(writeStream)
        .on("finish", () => {
          if (data) {
            EventManager.i.emit(ServerEvent.HOT_RELOAD, data);
          }

          resolve();
        })
        .on("error", (e) => {
          logger.error(e);
          resolve();
        });
    });
  }

  static async compileUserRuntime(data?: WatcherChange): Promise<void> {
    const userHelpersPath = Config.fullPath("helpers");
    const defaults = DashboardConfig.fullPath(
      "public",
      "bundles",
      "defaults.runtime.js"
    );

    const runtime = DashboardConfig.fullPath(
      "public",
      "bundles",
      "user.runtime"
    );

    const userRuntime =
      readFileSync(runtime)
        .toString()
        .replace("{{USER_HELPERS}}", userHelpersPath)
        .replace("{{DEFAULT_HELPERS}}", defaults);

    const runtimeDestPath = getServerFilePath("public", "user.runtime.js");

    writeFileSync(runtimeDestPath, userRuntime);

    const userFilePath = getServerFilePath("public", "user.bundle.js")

    logger.debug(`%p%P --> %s`, 1, -1, runtime);
    logger.debug(`%p%P <-- %s`, 1, -1, userFilePath);

    const writeStream = createWriteStream(userFilePath);

    return new Promise((resolve) => {
      compiler()
        .add(runtimeDestPath)
        .bundle()
        .pipe(writeStream)
        .on("finish", () => {
          if (Config.is("env", Env.Prod)) {
            logger.debug(`%p%P minifying output...`, 3, 0);

            const minFilename = runtimeDestPath.replace(".js", "min.js")

            logger.debug(`%p%P <-- %s`, 1, -1, minFilename);

            writeFileSync(
              minFilename,
              uglify.minify(
                {
                  [minFilename]: readFileSync(runtimeDestPath, "utf-8"),
                },
                {
                  sourceMap: true,
                }
              ).code,
              "utf-8"
            );
          }

          if (data) {
            EventManager.i.emit(ServerEvent.HOT_RELOAD, data);
          }

          resolve();
        })
        .on("error", (e) => {
          logger.error(e);
          resolve();
        });
    });
  }
}
