import glob from "glob";
import { Request, Response } from "express";
import importFresh from "import-fresh";
import { logger } from "../../services";
import { Config, EventManager, Server, ServerEvent } from "../core";
import {
  ControllerFunction,
  UserControllers,
  SafeObject,
  WatcherChange,
} from "../types";
import { ControllerAbstract } from "./abstract";
import * as _ from "lodash";

export class Controllers {
  private static controllers: UserControllers = {};

  static create() {
    logger.info(`%p%P Controllers`, 1, 1);
    logger.info(`%p%P from %s`, 3, 0, Config.relGlobPath("controllers"));
    EventManager.i.on(ServerEvent.CONTROLLERS_CHANGED, this.load.bind(this));
  }

  static async load(data?: WatcherChange): Promise<void> {
    logger.info(`%p%P Controllers`, 1, 1);
    const controllers = glob.sync(Config.fullGlobPath("controllers"));

    for (let i = 0; i < (controllers || []).length; i++) {
      try {
        const module = importFresh(controllers[i]);
        const name = this.normalizePath(controllers[i]);
        const fullName = `${name}.${controllers[i].split(".").pop()}`;

        logger.debug(`%p%P %s`, 3, 1, Config.relPath("controllers", fullName));

        this.instantiate(module, name, this.getModuleKey(module));
      } catch (e) {
        logger.warn(
          `%p%P Error: %s was not loaded: %O`,
          3,
          1,
          controllers[i],
          e
        );
      }
    }

    if (data) {
      EventManager.i.emit(ServerEvent.HOT_RELOAD, data);
    }
  }

  static async call(
    path: string,
    req: Request,
    res: Response,
    context: Record<string, any>
  ): Promise<SafeObject> {
    if (path in this.controllers) {
      logger.debug(`%P Invoking controller at ${path}`, 2);

      try {
        if (this.controllers[path] instanceof ControllerAbstract) {
          return (<ControllerAbstract>this.controllers[path]).handle(
            req,
            res,
            context
          );
        }
        return (<ControllerFunction>this.controllers[path])(req, res);
      } catch (e) {
        logger.error(
          "%p%P Error while executing controller %s call",
          3,
          0,
          path
        );
        logger.error("%O", e);
      }
    }

    return {};
  }

  static async handle(
    route: string,
    view: string,
    req: Request,
    res: Response
  ): Promise<SafeObject> {
    const authenticated = req.isAuthenticated && req.isAuthenticated();

    const context: Record<string, any> = {
      env: Config.get("env"),
      url: req.url,
      page: route,
      query: { ...req.query },
      params: { ...req.params },
      request: {
        ...req.query,
        ...req.params,
        ...req.body,
      },
      secure: req.secure,
      authenticated,
      user: req.user,
      xhr: req.xhr,
      auth: {
        terms: Config.get("auth.terms"),
        reCaptcha: Config.get("auth.reCaptcha"),
      },
    };

    // Add auth page routes to context
    _.forEach(Config.get<Record<string, string>>("auth.views"), (view, key) => {
      _.set(context, `auth.${key}`, `/${view}`);
    });

    // Add qualifying env variables to context
    _.forEach(_.keys(process.env), (key) => {
      if (_.startsWith(key, "HOTBARS_")) {
        const name = _.camelCase(_.replace(key, "HOTBARS_", ""));
        _.set(context, `vars.${name}`, process.env[key]);
      }
    });

    // Proxy messages to context
    if (Array.isArray(req.session.messages)) {
      context.messages = [...req.session.messages];
      req.session.messages = [];
    }

    // If enabled, add resend confirmation url to context
    if (
      authenticated &&
      !_.get(req.user, "confirmed") &&
      Config.get("auth.confirmEmail")
    ) {
      const url = new URL("/sign-up/confirm/re-send", Server.url);
      url.searchParams.append("username", _.get(req.user, "username", ""));
      url.searchParams.append("provider", _.get(req.user, "provider", ""));
      context.resendUrl = url.href;
    }

    // call the main controller with the loaded context
    const mainResult = await this.call("_main", req, res, context);

    if (_.isPlainObject(mainResult)) {
      _.merge(context, mainResult);
    }

    // Call the page controller with the context
    const result = await this.call(view, req, res, context);

    if (_.isPlainObject(result)) {
      _.merge(context, result);
    }

    return context;
  }

  private static getModuleKey(module: any): string | undefined {
    if ("controller" in module) {
      return "controller";
    } else if ("default" in module) {
      return "default";
    }
    return;
  }

  private static instantiate(module: any, name: string, key?: string): void {
    if (!key) return;
    const config = Config.get<Config>();

    if (this.isClass(module[key])) {
      logger.debug(`%P Initializing controller class: %s - %s`, 2, key, name);
      this.controllers[name] = new module[key](config);
    } else {
      logger.debug(
        `%P Initializing controller function: %s - %s`,
        2,
        key,
        name
      );
      this.controllers[name] = (
        (config: Readonly<Config>) => (req: Request, res: Response) =>
          module[key](config, req, res)
      )(config);
    }
  }

  private static normalizePath(controllerPath: string) {
    return controllerPath
      .replace(Config.fullPath("controllers"), "")
      .replace(".js", "")
      .substring(1);
  }

  private static isClass(func: any) {
    return (
      typeof func === "function" &&
      /^class\s/.test(Function.prototype.toString.call(func))
    );
  }
}
