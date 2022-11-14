import glob from "glob";
import passport from "passport";
import { AuthStrategyAbstract } from "../../abstract";
import { logger } from "../services";
import { Config } from "./config";

export class Authentication {

  private static strategies: {[name: string]: AuthStrategyAbstract} = {};

  static async load() {
    logger.info("Loading controllers...");

    if (!Config.get("auth")) return;

    const strategies = glob.sync(Config.fullGlobPath("auth", "js"));

    for (let i = 0; i < (strategies || []).length; i++) {
      const module = await import(strategies[i]);
      const name = this.normalizePath(strategies[i]);
      const fullName = `/${name}.${strategies[i].split(".").pop()}`;

      logger.debug(`-- ${Config.relPath("auth", fullName)}`);

      this.strategies[name] = new module.default();

      passport.use(this.strategies[name].createStrategy());
    }
  }

  private static normalizePath(strategyPath: string) {
    return strategyPath
      .replace(Config.fullPath("auth"), "")
      .replace(".js", "")
      .substring(1);
  }

  static names(): string[] {
    return Object.keys(this.strategies);
  }

  static has(name: string): boolean {
    return this.strategies[name] !== undefined;
  }

  static get(name: string): AuthStrategyAbstract {
    return this.strategies[name];
  }
}
