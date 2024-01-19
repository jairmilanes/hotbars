import { spawnSync } from "child_process";
import sass from "sass";
import sassGraph from "sass-graph";
import { logger } from "../../services";
import { Config, EventManager, ServerEvent } from "../core";
import { basename, joinPath, slash } from "../utils";
import { Env, WatcherChange, WatcherChangeType } from "../types";

export class SassCompiler {
  static graph: any;

  static create(): void {
    if (Config.is("env", Env.Dev)) {
      logger.debug(`%p%P Sass compiler`, 1, 1);
      EventManager.i.on(ServerEvent.SASS_CHANGED, this.compile);
    }
  }

  static compile(data?: WatcherChange): void {
    logger.debug(`%p%P Compiling SASS files`, 1, 1);

    const sourcePath = Config.relPath("styles");

    const files = SassCompiler.findBaseFiles(
      sourcePath,
      data ? data?.structural : true,
      data?.path
    );

    logger.debug("%p%P targets %O", 3, 0, files);

    const cwd = Config.value<string>("root");
    const env = Config.get("env");

    const paths = files.map(
      (file: string) =>
        `${file}:${file
          .replace(
            Config.get("styles"),
            joinPath(Config.get("public"), Config.get("styles"))
          )
          .replace("scss", "css")}`
    );

    if (!paths.length) {
      logger.warn("%p%P No targets found for path %s", 3, 0);
      logger.debug(this.graph);
      return;
    }

    logger.debug(`%p%P compiling:`, 3, 0);

    paths.forEach((path: string) => {
      logger.debug(`%p%P %s`, 5, 1, path);
    });

    try {
      const result = spawnSync(
        "sass",
        [
          paths.join(" "),
          "--style",
          env !== "development" ? "compressed" : "expanded",
        ],
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

      if (data) {
        EventManager.i.emit(ServerEvent.HOT_RELOAD, {
          ...data,
          type: WatcherChangeType.Css,
          path: paths.map((path) => path.split(":")[1]),
        });
      }
    } catch (e) {
      logger.error("%p%P %O", 3, 1, e);
    }
  }

  private static findBaseFiles(
    source: string,
    reMap: boolean,
    path?: string
  ): string[] {
    if (reMap) {
      this.graph = sassGraph.parseDir(source, {
        extensions: ["scss"],
      });
    }

    logger.debug("%p%P from %s", 3, 0, source);

    const files = Object.keys(this.graph.index).map((path) => {
      const filename = basename(path);

      return {
        ...this.graph.index[path],
        path: slash(path),
        filename: filename,
      };
    });

    if (path) {
      logger.debug("%p%P path %s", 3, 0, path);

      const target = files.find((file) => {
        return file.path.endsWith(path);
      });

      if (target) {
        if (target.importedBy.length) {
          return target?.importedBy
            .map((path: string) =>
              slash(path).replace(`${Config.get("root")}/`, "")
            )
            .filter((path: string) => !basename(path).startsWith("_"));
        }

        if (!basename(target.path).startsWith("_")) {
          return [target.path.replace(`${Config.get("root")}/`, "")];
        }
      }

      return [];
    }

    return files
      .filter((file) => !file.filename.startsWith("_"))
      .map((file) => file.path.replace(`${Config.get("root")}/`, ""));
  }
}
