import { createWriteStream, readFileSync, writeFileSync } from "fs";
import compiler from "browserify";
import { logger } from "../../services";
import { Config, DashboardConfig, EventManager, ServerEvent } from "../core";
import { WatcherChange } from "../types";

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
    logger.info(`%p%P Browserify: Compiling user's runtime...`, 1, 1);
    const runtime = DashboardConfig.fullPath(
      "public",
      "bundles",
      "dashboard.runtime.js"
    );
    const writeStream = createWriteStream(
      DashboardConfig.fullPath(
        "public",
        "bundles",
        "dashboard.bundle.js"
      ).replace("src", "dist")
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
    logger.info(`%p%P Browserify: Compiling dashboard's runtime...`, 1, 1);

    const userHelpersPath = Config.fullPath("helpers");
    const runtime = DashboardConfig.fullPath(
      "public",
      "bundles",
      "user.runtime"
    );
    const userRuntimeTemplate = readFileSync(runtime);

    const userRuntime = userRuntimeTemplate
      .toString()
      .replace("{{USER_HELPERS}}", userHelpersPath);

    const runtimeDestPath = DashboardConfig.fullPath(
      "public",
      "bundles",
      "user.runtime.js"
    );

    writeFileSync(runtimeDestPath, userRuntime);

    const writeStream = createWriteStream(
      DashboardConfig.fullPath("public", "bundles", "user.bundle.js")
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

          resolve();
        })
        .on("error", (e) => {
          logger.error(e);
          resolve();
        });
    });
  }
}
