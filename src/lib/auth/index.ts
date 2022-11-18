import glob from "glob";
import passport from "passport";
import { StrategyAbstract } from "./strategies/strategy.abstract";
import { Config } from "../core";
import { logger } from "../services";
import { DataManager } from "../data";

export class AuthManager {
  private static strategies: { [name: string]: StrategyAbstract } = {};

  static register(name: string, strategy: StrategyAbstract) {
    if (strategy instanceof StrategyAbstract) {
      this.strategies[name] = strategy;
    }
  }

  static async load() {
    if (!Config.enabled("auth")) {
      logger.warn(
        "Authentication disabled, you may enabled it in your configuration file."
      );
      return;
    }

    logger.info("Loading authentication strategies...");

    const strategies = glob.sync(Config.fullGlobPath("auth.path", "js"));

    for (let i = 0; i < (strategies || []).length; i++) {
      const module = await import(strategies[i]);
      const name = this.normalizePath(strategies[i]);

      logger.debug(`-- found /${name}.${strategies[i].split(".").pop()}`);

      const authModule = new module.default() as StrategyAbstract;

      this.strategies[authModule.name] = authModule;

      passport.use(this.strategies[authModule.name].createStrategy());
    }

    logger.debug("---- Setting up session serialization");
    this.serialize();
  }

  private static serialize() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    passport.serializeUser(function (user: any, cb) {
      logger.debug("-- Auth:Serialize session user", user);
      process.nextTick(function () {
        if (user.provider) {
          // const {} = user as Profile;
          logger.debug("Saving session", user.id);
        }

        return cb(null, user.id);
      });
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    passport.deserializeUser(function (userId: any, cb) {
      logger.debug("-- Auth:Deserialize session user", userId);
      process.nextTick(function () {
        const usersDb = DataManager.get().from(
          Config.get<string>("auth.usersTable")
        );
        return usersDb
          .get(userId)
          .then((user) => {
            logger.debug("---- User reloaded", user);
            cb(null, user);
          })
          .catch(cb);
      });
    });
  }

  private static normalizePath(strategyPath: string) {
    return strategyPath
      .replace(Config.fullPath("auth.path"), "")
      .replace(".js", "")
      .substring(1);
  }

  static names(): string[] {
    return Object.keys(this.strategies);
  }

  static has(name: string): boolean {
    return this.strategies[name] !== undefined;
  }

  static get(name: string): StrategyAbstract {
    return this.strategies[name];
  }
}
