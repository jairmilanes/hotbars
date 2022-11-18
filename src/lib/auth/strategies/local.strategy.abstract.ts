import get from "lodash/get";
import { compare } from "bcryptjs";
import { Strategy as LocalStrategy } from "passport-local";
import { AuthenticateCallback, User } from "../../../types";
import { Config } from "../../core";
import { StrategyAbstract } from "./strategy.abstract";
import { logger } from "../../services";

export abstract class LocalAuthStrategyAbstract extends StrategyAbstract {
  protected constructor(name?: string) {
    super(name || "local");
  }

  createStrategy() {
    return new LocalStrategy(this.authenticate.bind(this));
  }

  configure() {
    return {
      successRedirect: this.successRedirect,
      failureRedirect: this.failureRedirect,
    };
  }

  async authenticate(
    username: string,
    password: string,
    done: AuthenticateCallback
  ) {
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
        logger.info("User authenticated successfully", user);
        return done(undefined, user);
      }

      return done(undefined, false);
    } catch (e) {
      return done(e as Error, false);
    }
  }

  abstract getUser(username: string): Promise<User>;
}
