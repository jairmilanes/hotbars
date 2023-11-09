import {
  Strategy as RememberMeStrategy,
  RefreshCallback,
  TokenSavedCallback
} from "@jmilanes/passport-remember-me";
import { LocalAuthStrategy } from "./local.strategy";
import { Config } from "../../core";
import { logger } from "../../../services";

export { rememberUser, signOut } from "@jmilanes/passport-remember-me"

export class RememberMeAuthStrategy extends LocalAuthStrategy {
  constructor() {
    super("rememberMe");
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  createStrategy() {
    const strat = new RememberMeStrategy(
      {
        salt: Config.get("auth.session.secret"),
        keyName: this.name,
        cookie: { maxAge: Config.get<number>("auth.rememberMe") },
        logger
      },
      this.getUserWithToken.bind(this),
      this.saveToken.bind(this),
    );
    strat.name = this.name;
    return strat;
  }

  async getUserWithToken(userId: string, token: string, done: RefreshCallback) {
    try {
      const user = this.db
        .eq("id", userId)
        .eq("remember", token)
        .single();

      return done(null, user);
    } catch(e) {
      return done(e as Error);
    }
  }

  async saveToken(token: string, userId: string, done: TokenSavedCallback) {
    try {
      await this.updateUser(userId, { remember: token });
    } catch (e) {
      return done(e as Error);
    }
  }
}
