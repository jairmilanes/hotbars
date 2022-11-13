import glob from "glob";
import { Request, Response } from "express";
import { ControllerFunction, UserControllers, SafeObject } from "../../types";
import { ControllerAbstract } from "../../abstract";
import { Config } from "./config";
import { logger } from "../services";

export class Controllers {
  private static controllers: UserControllers = {};

  static async load(): Promise<void> {
    logger.info("Loading controllers...");
    const controllers = glob.sync(Config.fullGlobPath("controllers"));

    for (let i = 0; i < (controllers || []).length; i++) {
      const module = await import(controllers[i]);
      const name = this.normalizePath(controllers[i]);
      const fullName = `/${name}.${controllers[i].split(".").pop()}`;

      logger.debug(`-- ${Config.relPath("controllers", fullName)}`);

      try {
        this.instantiate(module, name, this.getModuleKey(module));
      } catch (e) {
        logger.warn(`-- failed to load controller: ${controllers[i]}`);
      }
    }
  }

  static async call(
    path: string,
    req: Request,
    res: Response
  ): Promise<SafeObject> {
    if (path in this.controllers) {
      logger.debug(`Controller: ${path}`);

      if (this.controllers[path] instanceof ControllerAbstract) {
        return (<ControllerAbstract>this.controllers[path]).handle(req, res);
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
    const config = Config.get();

    logger.debug(`-- Initializing: ${key} - ${name}`);
    logger.debug(module);

    if (this.isClass(module[key])) {
      logger.debug(`-- Class mode`);
      this.controllers[name] = new module[key](config);
    } else {
      logger.debug(`-- Function mode`);
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
