import glob from "glob";
import { Request, Response } from "express";
import importFresh from "import-fresh";
import { logger } from "../../services";
import { ContextConfig, Config, EventManager, Server, ServerEvent, DashboardConfig } from "../core";
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
    EventManager.i.on(ServerEvent.CONTROLLERS_CHANGED, this.load.bind(this));
  }

  /**
   * Loads all available controllers, from user app and dashboard.
   *
   * @param data
   */
  static async load(data?: WatcherChange): Promise<void> {
    const controllers = [
      ...glob.sync(Config.fullGlobPath("controllers")),
      ...glob.sync(DashboardConfig.fullGlobPath("controllers")),
    ];

    logger.info(`%p%P Loading controllers:`, 1, 1);

    for (let i = 0; i < (controllers || []).length; i++) {
      try {
        const isDashboard = controllers[i].match(DashboardConfig.relPath("controllers")) !== null;
        const module = importFresh(controllers[i]);
        const name = this.normalizePath(controllers[i]);
        this.instantiate(module, name, isDashboard);
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
    logger.debug(`Controller lookup: %s`, 2, 1, path);

    if (path in this.controllers) {
      logger.debug(`%P Found ${path}`, 2, 1);

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
          1,
          path
        );
        logger.error("%O", e);
      }
    }

    logger.debug(`%P Not found: ${path}`, 2, Object.keys(this.controllers));

    return {};
  }

  static async handle(
    route: string,
    view: string,
    req: Request,
    res: Response
  ): Promise<SafeObject> {
    ContextConfig.init(req);
    const authenticated = req.isAuthenticated && req.isAuthenticated();

    const context: Record<string, any> = {
      env: ContextConfig.get("env"),
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
        terms: ContextConfig.get("auth.terms"),
        reCaptcha: ContextConfig.get("auth.reCaptcha"),
      },
    };

    // Add auth page routes to context
    _.forEach(ContextConfig.get<Record<string, string>>("auth.views"), (view, key) => {
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
      ContextConfig.get("auth.confirmEmail")
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

  private static instantiate(module: any, name: string, isDash: boolean): void {
    const key = this.getModuleKey(module)

    if (!key) return;

    const config = ContextConfig.init(isDash);

    if (this.isClass(module[key])) {
      logger.debug(`%p%P Class: %s`, 3, 0, name);
      this.controllers[name] = new module[key](config);
    } else {
      logger.debug(
        `%p%P Function: %s`,
        3, 0,
        name
      );
      this.controllers[name] = (
        config => (req: Request, res: Response) =>
          module[key](config, req, res)
      )(config);
    }
  }

  private static normalizePath(controllerPath: string) {
    const config = ContextConfig.init(
      controllerPath.match(DashboardConfig.relPath("controllers")) !== null
    );

    return controllerPath
      .replace(
        config.fullPath("controllers"),
        config.fullPath("views")
      )
      .replace(".js", "");
  }

  private static isClass(func: any) {
    return (
      typeof func === "function" &&
      /^class\s/.test(Function.prototype.toString.call(func))
    );
  }
}
