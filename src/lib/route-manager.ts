import { Application } from "express-ws";
import glob from "glob";
import { RouteLayer, TrackedRoute, SafeObject } from "../types";
import { logger } from "./logger";
import { Config } from "./config";

export class RouteManager {
  routes: TrackedRoute[] = [];

  private readonly app: Application;

  private readonly config: Config;

  private userTemplates: SafeObject = {};

  constructor(app: Application, config: Config) {
    this.app = app;
    this.config = config;
  }

  clear(stack: RouteLayer[] = []): void {
    logger.debug(`-- Clearing ${stack.length} routes...`);

    if (stack && stack.length) {
      stack.forEach((layer) => {
        if (["query", "expressInit"].indexOf(layer.name) < 0) {
          this.remove(layer.route?.path || layer.name, stack);
        }
      });

      logger.debug(`-- Router stack cleared, size: ${stack.length}`);

      this.userTemplates = {};
    }
  }

  generate(): string[] {
    logger.debug(
      "-- User views: ",
      `${this.config.views}/**/*.${this.config.extname}`
    );

    const paths = this.resolvePaths();

    logger.debug(
      `-- Found ${paths.length} views under "${this.config.views}".`
    );

    paths.forEach((entry) => {
      const { route, view } = this.parsePath(entry);

      this.userTemplates[route] = view;

      this.app.get(route, (req, res) => {
        res.status(200).render(view, {
          url: req.url,
          query: { ...req.query },
          params: { ...req.params },
          secure: req.secure,
          xhr: req.xhr,
        });
      });

      logger.debug(`---- New route: "${route}" -> View: "${view}"`);
    });

    if (!this.userTemplates["/"]) {
      logger.warn(
        `------ Base route "/" with an "index" view was not found, your app has no home page, to fix add an index.${this.config.extname} to your ${this.config.views} directory, otherwise "/" will result in a 404 error.`
      );
    }

    logger.debug(`-- Auto routes done.`);

    return paths;
  }

  hasUserView(name: string): boolean {
    return (
      Object.keys(this.userTemplates).find(
        (path) => this.userTemplates[path] === name
      ) !== undefined
    );
  }

  hasUserRoute(path: string): boolean {
    return this.userTemplates[path] !== undefined;
  }

  private parsePath(path: string): { route: string; view: string } {
    const pathParts: string[] = path
      .replace(`${this.config.views}/`, "")
      .split("/");
    const routeParts: string[] = [];
    const viewParts: string[] = [];

    pathParts.forEach((part) => {
      const name = part.replace(`.${this.config.extname}`, "");

      if (name.startsWith("[")) {
        // Path is a param, check for closing tag
        if (!name.endsWith("]")) {
          logger.warn(
            `------ Route ${path} is missing a closing tag "]", if not fixed it will not be dynamically interpreted.`
          );
          routeParts.push(`${name}]`);
        } else {
          const paramName = name.replace(/\[|\]/g, "");
          routeParts.push(`:${paramName}`);
        }
      } else if (name !== "index") {
        routeParts.push(name);
      }

      viewParts.push(name);
    });

    return {
      route: `/${routeParts.join("/")}`,
      view: viewParts.join("/"),
    };
  }

  private resolvePaths(): string[] {
    const paths = glob.sync(
      `${this.config.views}/**/*.${this.config.extname}`,
      { nodir: true, cwd: this.config.root }
    );

    if (!paths.length) {
      logger.info(
        `-- No views under "${this.config.views}" were found, routes generation aborted.`
      );
      return [];
    }

    return paths;
  }

  private remove(name: string, stack: RouteLayer[]) {
    const foundIndex = stack.findIndex(
      (st) => st?.route?.path === name || st?.name == name
    );

    if (foundIndex > -1) {
      const removed = stack.splice(foundIndex, 1);

      if (removed.length) {
        logger.debug(
          "-- Route removed",
          name,
          removed[0]?.route?.path || removed[0]?.route?.name
        );
      }
    }
  }
}
