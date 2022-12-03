import glob from "glob";
import { Request, Response } from "express";
import importFresh from "import-fresh";
import { logger } from "../../services";
import { Config, EventManager, ServerEvent } from "../core";
import {
  ControllerFunction,
  UserControllers,
  SafeObject,
  WatcherChange,
} from "../types";
import { ControllerAbstract } from "./abstract";

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
      const module = importFresh(controllers[i]);
      const name = this.normalizePath(controllers[i]);
      const fullName = `${name}.${controllers[i].split(".").pop()}`;

      logger.debug(`%p%P %s`, 3, 1, Config.relPath("controllers", fullName));

      try {
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
    res: Response
  ): Promise<SafeObject> {
    if (path in this.controllers) {
      logger.debug(`%P Invoking controller at ${path}`, 2);

      if (this.controllers[path] instanceof ControllerAbstract) {
        return (<ControllerAbstract>this.controllers[path]).handle(req);
      }
      return (<ControllerFunction>this.controllers[path])(req, res);
    }
    return {};
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
