import { compare } from "bcryptjs";
import { Strategy as LocalStrategy } from "passport-local";
import { StrategyAbstract } from "./strategy.abstract";
import { AuthenticateCallback, User } from "../../../types";

export abstract class LocalAuthStrateygyAbstract extends StrategyAbstract {
  constructor() {
    super("local");
  }

  createStrategy() {
    return new LocalStrategy(this.authenticate.bind(this));
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
      const valid = await compare(password, user.password);

      if (valid) {
        return done(undefined, user);
      }

      return done(undefined, false);
    } catch (e) {
      return done(e as Error, false);
    }
  }

  abstract getUser(username: string): Promise<User>;
}
