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
    logger.debug(`%p%P Runtime compiler`, 1, 1);
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
    logger.debug(`%p%P Dashboard's runtime`, 1, 1);
    const runtime = DashboardConfig.fullPath(
      "public",
      "bundles",
      "dashboard.runtime.js"
    );
    const writeStream = createWriteStream(
      DashboardConfig.fullPath("public", "bundles", "dashboard.bundle.js") // .replace("src", "dist")
    );

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
    logger.debug(`%p%P Users's runtime`, 1, 1);

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

    const writeStream = createWriteStream(
      getServerFilePath("public", "user.bundle.js")
    );

    return new Promise((resolve) => {
      compiler()
        .add(runtimeDestPath)
        .bundle()
        .pipe(writeStream)
        .on("finish", () => {
          if (data) {
            EventManager.i.emit(ServerEvent.HOT_RELOAD, data);
          }

          if (Config.is("env", Env.Prod)) {
            logger.debug(`%p%P minifying output...`, 3, 0);

            const minFilename = runtimeDestPath.replace(".js", "min.js")

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

          resolve();
        })
        .on("error", (e) => {
          logger.error(e);
          resolve();
        });
    });
  }
}
