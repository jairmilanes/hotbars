import {
  Strategy as RememberMeStrategy,
  RefreshCallback,
  TokenSavedCallback
} from "@jmilanes/passport-remember-me";
import { LocalAuthStrategy } from "./local.strategy";
import { ContextConfig } from "../../core";
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
        salt: ContextConfig.get("auth.session.secret"),
        keyName: this.name,
        cookie: { maxAge: ContextConfig.get<number>("auth.rememberMe") },
        logger,
        successRedirect: `/${ContextConfig.get("auth.views.signInRedirect")}` || "/"
      },
      this.getUserWithToken.bind(this),
      this.saveToken.bind(this),
    );
    strat.name = this.name;
    return strat;
  }

  async getUserWithToken(userId: string, token: string, done: RefreshCallback) {
    try {
      const user = await this.db
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
      return done()
    } catch (e) {
      return done(e as Error);
    }
  }
}
