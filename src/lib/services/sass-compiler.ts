import { spawnSync } from "node:child_process";
import { logger } from "./logger";
import { Config } from "../core";
import { resolvePath } from "../utils";

export const compileSass = (
  sourcePath: string,
  destPath: string,
  cwd: string,
  env: string
): void => {
  const path = `${sourcePath}:${destPath}`;

  logger.info(`Preprocessing styles...`);
  logger.debug(`-- ${path}`);

  try {
    const result = spawnSync(
      `"${resolvePath(
        Config.get("serverRoot"),
        "node_modules",
        ".bin",
        "sass"
      )}"`,
      [path, "--style", env !== "development" ? "compressed" : "expanded"],
      {
        cwd,
        shell: true,
      }
    );

    if (result.error) {
      const stderr = result?.stderr.toString().trim();
      if (stderr.length) {
        logger.debug("error:", result?.stderr.toString());
      }
    } else {
      const stdout = result?.stdout.toString().trim();

      if (stdout.length) {
        logger.debug("out:", result?.stdout.toString());
      }
    }

    const output = result?.output.toString().trim();

    if (output.length) {
      output.split(/\r?\n|\r|\n/g).forEach((line) => {
        const result = line.replace(",,", "").trim();
        if (result.length) {
          logger.debug(`-- ${result}`);
        }
      });
    }
  } catch (e) {
    logger.error("-- error:", e);
  }
};
