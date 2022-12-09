import get from "lodash/get";
import { compare } from "bcryptjs";
import { Strategy as LocalStrategy } from "passport-local";
import { logger } from "../../../services";
import { User } from "../../types";
import { Config } from "../../core";
import { StrategyAbstract } from "./strategy.abstract";

export abstract class LocalAuthStrategyAbstract extends StrategyAbstract {
  protected constructor(name?: string) {
    super(name || "local");
  }

  createStrategy() {
    const strat = new LocalStrategy(this.authenticate.bind(this));
    strat.name = this.name;
    return strat;
  }

  configure(): Record<string, any> {
    return {
      successRedirect: this.successRedirect,
      failureRedirect: this.failureRedirect,
      failureMessage: true
    };
  }

  async authenticate(...args: any[]) {
    const [username, password, done] = args;
    const user: User = await this.getUser(username);

    if (!user) {
      return done(undefined, false, {
        message: "Incorrect username or password.",
      });
    }

    try {
      const valid = await compare(
        password,
        get(user, Config.get<string>("auth.passwordColumn"))
      );

      if (valid) {
        logger.info("User authenticated successfully.", user);

        return done(undefined, user);
      }

      logger.warn("Incorrect password for user %s.", user.username);

      return done(undefined, false, {
        message: "Incorrect username or password.",
      });
    } catch (e) {
      logger.error("Authentication error %O.", e);

      return done(e as Error, false, {
        message: "Unknown error.",
      });
    }
  }

  abstract getUser(username: string): Promise<User>;
}
