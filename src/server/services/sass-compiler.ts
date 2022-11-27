import { spawnSync } from "node:child_process";
import { logger } from "../../services";
import { Config, EventManager, ServerEvent } from "../core";
import { joinPath } from "../utils";

export class SassCompiler {
  static create(): void {
    logger.debug(`%p%P Sass compiler`, 1, 1);
    EventManager.i.on(ServerEvent.SASS_CHANGED, this.compile);
  }

  static compile(): void {
    logger.info(`%p%P Sass`, 1, 1);

    const sourcePath = Config.relPath("styles");
    const destPath = joinPath(
      Config.relPath("public"),
      Config.value<string>("styles")
    );
    const cwd = Config.value<string>("root");
    const env = Config.get("env");
    const path = `${sourcePath}:${destPath}`;

    logger.debug(`%p%P compiling ${path}`, 3, 0);

    try {
      const result = spawnSync(
        "sass",
        [path, "--style", env !== "development" ? "compressed" : "expanded"],
        {
          cwd,
          shell: true,
        }
      );

      if (result.error) {
        const stderr = result.stderr.toString().trim();
        if (stderr.length) {
          logger.debug("%p%P %s", 3, 1, result.stderr.toString());
        }
      } else {
        const stdout = result.stdout.toString().trim();

        if (stdout.length) {
          logger.debug("%p%P %s", 3, 1, result.stdout.toString());
        }
      }

      const output = result.output.toString().trim();

      if (output.length) {
        output.split(/\r?\n|\r|\n/g).forEach((line) => {
          const result = line.replace(",,", "").trim();
          if (result.length) {
            logger.debug(`%p%P %s`, 3, 1, result);
          }
        });
      }
    } catch (e) {
      logger.error("%p%P %O", 3, 1, e);
    }
  }
}
