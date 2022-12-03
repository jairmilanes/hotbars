import glob from "glob";
import passport from "passport";
import { logger } from "../../services";
import { Config, EventManager, ServerEvent } from "../core";
import { DataManager } from "../data";
import { StrategyAbstract } from "./strategies/strategy.abstract";
import { WatcherChange } from "../types";

export class AuthManager {
  private static strategies: { [name: string]: StrategyAbstract } = {};

  static create() {
    if (!Config.enabled("mailer")) {
      logger.warn(
        `%p%P Mailer is currently disabled, authentication 
                        depends on email capabilities, add our email 
                        configurations before enabling authentication.`,
        1,
        1
      );

      logger.error(`%p%P Authentication has not been enabled.`, 3, 0);
      return;
    }

    logger.info(`%p%P Auth Manager`, 1, 1);

    EventManager.i.on(
      ServerEvent.AUTH_HANDLERS_CHANGED,
      this.loadStrategies.bind(this)
    );
  }

  static register(name: string, strategy: StrategyAbstract) {
    if (strategy instanceof StrategyAbstract) {
      this.strategies[name] = strategy;
    }
  }

  static async load(data?: WatcherChange) {
    if (!this.enabled()) {
      return;
    }

    await this.loadStrategies();

    logger.debug("%p%P Setting up session serialization", 3, 0);
    this.serialize();
  }

  private static async loadStrategies(data?: WatcherChange) {
    if (!this.enabled()) {
      return;
    }

    logger.info("%p%P Auth strategies", 1, 1);

    const strategies = glob.sync(Config.fullGlobPath("auth.path", ".js"));

    for (let i = 0; i < (strategies || []).length; i++) {
      const module = await import(strategies[i]);
      const name = this.normalizePath(strategies[i]);

      logger.debug(
        `%p%P found /%s.%s`,
        3,
        0,
        name,
        strategies[i].split(".").pop()
      );

      const authModule = new module.default() as StrategyAbstract;

      logger.debug("%p%P registering %s", 3, 0, authModule.name);

      this.strategies[authModule.name] = authModule;

      passport.use(this.strategies[authModule.name].createStrategy());
    }

    if (data) {
      EventManager.i.emit(ServerEvent.HOT_RELOAD, data);
    }
  }

  private static enabled(): boolean {
    if (!Config.enabled("auth")) {
      logger.warn("%p%P Auth disabled, skipping.", 1, 1);
      return false;
    }

    if (!Config.enabled("mailer")) {
      logger.warn(
        "%p%P Auth depends on Mailer, configure your email settings before enabling authentication, skipping.",
        1,
        1
      );
      return false;
    }

    return true;
  }

  private static serialize() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    passport.serializeUser(function (user: any, cb) {
      logger.debug("%P Auth:Serialize session user %o", 2, user);
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
      logger.debug("%P Auth:Deserialize session user %s", 2, userId);
      process.nextTick(function () {
        const usersDb = DataManager.get("jsonDb").from(
          Config.get<string>("auth.usersTable")
        );
        return usersDb
          .get(userId)
          .then((user) => {
            logger.debug("%P User reloaded %o", 2, user);
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
