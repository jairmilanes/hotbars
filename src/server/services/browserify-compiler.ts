import { tmpdir } from "os";
import { createWriteStream, readFileSync, writeFileSync } from "fs";
import compiler from "browserify";
import uglify from "uglify-js";
import { logger } from "../../services";
import { Config, DashboardConfig, EventManager, ServerEvent } from "../core";
import { Env, WatcherChange } from "../types";
import { joinPath } from "../utils";

export class BrowserifyCompiler {
  static userDir = tmpdir();

  static create(): void {
    logger.debug(`%p%P Runtime compiler`, 1, 1);
    EventManager.i.on(
      ServerEvent.USER_RUNTIME_CHANGED,
      this.compileUserRuntime
    );
    /* EventManager.i.on(
      ServerEvent.DASHBOARD_RUNTIME_CHANGED,
      this.compileDashboardRuntime
    ); */
  }

  static compileDashboardRuntime(data?: WatcherChange): Promise<void> {
    logger.debug(`%p%P Browserify: Compiling dashboard's runtime...`, 1, 1);
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
    logger.debug(`%p%P Browserify: Compiling users's runtime...`, 1, 1);

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
    const userRuntimeTemplate = readFileSync(runtime);

    const userRuntime = userRuntimeTemplate
      .toString()
      .replace("{{USER_HELPERS}}", userHelpersPath)
      .replace("{{DEFAULT_HELPERS}}", defaults);

    const runtimeDestPath = joinPath(this.userDir, "user.runtime.js");

    writeFileSync(runtimeDestPath, userRuntime);

    const writeStream = createWriteStream(
      joinPath(this.userDir, "user.bundle.js")
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

            writeFileSync(
              joinPath(this.userDir, "user.bundle.min.js"),
              uglify.minify(
                {
                  "user.runtime.js": readFileSync(runtimeDestPath, "utf-8"),
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
