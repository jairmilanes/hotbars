import * as _ from "lodash";
import { compare, hash } from "bcryptjs";
import { IVerifyOptions, Strategy as LocalStrategy } from "passport-local";
import { logger } from "../../../services";
import { ActionResponse, AuthDoneCallback, User } from "../../types";
import { Config, ContextConfig, Server } from "../../core";
import { StrategyAbstract } from "./strategy.abstract";
import { Mailer } from "../../services";
import { DataManager } from "../../data";
import process from "process";
import { AuthException } from "../../exceptions/auth.exception";
import { Request } from "express";

export const AUTH_ERROR_CODE = {
  INVALID_EMAIL_ADDRESS: "invalid-email-address",
  MAILER_DISABLED: "mailer-disabled",
  UNEXPECTED_ERROR: "unexpected-error",
  INVALID_PASSWORD: "invalid-password",
};

export class LocalAuthStrategy extends StrategyAbstract {
  constructor(name?: string) {
    super(name || "local");

    if (Config.get("auth.rememberMe")) {
      // Allows to move to the next middleware if authentication
      // is successfull, necessary for remember me functionality
      this.successRedirect = undefined;
    }
  }

  protected get db() {
    return DataManager.get().from(Config.get<string>("auth.usersTable"));
  }

  createStrategy() {
    const strat = new LocalStrategy(this.authenticate.bind(this));
    strat.name = this.name;
    return strat;
  }

  configure(req: Request): Record<string, any> {
    ContextConfig.init(req)
    return {
      successRedirect: !ContextConfig.get("auth.rememberMe") ? this.successRedirect : undefined,
      failureRedirect: this.failureRedirect,
      failureMessage: true,
    };
  }

  async getUser(emailOrUsername: string): Promise<User> {
    const column =
      emailOrUsername.indexOf("@") > -1
        ? "auth.emailColumn"
        : "auth.usernameColumn";

    logger.info("Auth column", column, emailOrUsername);

    const record = await this.db
      .eq(ContextConfig.get<string>(column), emailOrUsername)
      .single();

    return record as User;
  }

  /**
   * @throws {AuthException}
   */
  async createUser(data: Record<string, any>): Promise<User|never> {
    const profile = {
      username: _.get(data, ContextConfig.get("auth.usernameColumn")),
      email: _.get(data, ContextConfig.get("auth.emailColumn")),
      password: _.get(data, ContextConfig.get("auth.passwordColumn")),
    };

    // Hash password
    profile.password = await this.hashPassowrd(profile.password);

    if (profile.password instanceof AuthException) {
      throw new AuthException(
        "Faild to generate secure password.",
        AUTH_ERROR_CODE.UNEXPECTED_ERROR
      );
    }

    const user = (await this.db.insert({
      confirmed: false,
      provider: this.name,
      ...profile,
    })) as User;

    logger.debug("User created %O", user);

    return user;
  }

  async updateUser(userId: string, data: Record<string, any>): Promise<User> {
    const updated = (await this.db.update(
      userId,
      _.omit(data, ["provider"])
    )) as User;

    logger.debug("User updated %O", updated);

    return updated;
  }

  async authenticate(
    username: string,
    password: string,
    done: AuthDoneCallback<IVerifyOptions>
  ): Promise<ActionResponse<AuthException, User | false>> {
    const user: User = await this.getUser(username);
    const result: ActionResponse<AuthException, User | false> = {
      error: undefined,
    };

    if (!user) {
      result.data = false;
      result.message = "Incorrect username or password.";
      done(result.error, result.data, result.message);

      return result;
    }

    try {
      const valid = await compare(
        password,
        _.get(user, ContextConfig.get<string>("auth.passwordColumn"))
      );

      if (valid) {
        logger.info("User authenticated successfully.", user);
        result.data = user;
        done(result.error, result.data, result.message);

        return result;
      }

      logger.warn("Incorrect password for user %s.", user.username);

      result.data = false;
      result.message = "Incorrect username or password.";
      done(result.error, result.data, result.message);
    } catch (e) {
      logger.error("Authentication error %O.", e);
      result.error = new AuthException(
        (e as Error).message,
        AUTH_ERROR_CODE.UNEXPECTED_ERROR,
        e as Error
      );
      result.data = false;
      result.message = "Unknown error.";
      done(result.error, result.data, result.message);
    }

    return result;
  }

  async sendEmailConfirmation(user: User, provider: string) {
    const url = new URL(
      `/${ContextConfig.get("auth.views.signUp")}/confirm`,
      Server.url
    );
    url.searchParams.append("username", user.username);
    url.searchParams.append("provider", provider);

    logger.debug(`Sending email to %s`, user.email);

    await Mailer.sendTemplate(
      user.email,
      "Email Verification",
      "sign-up-confirmation",
      {
        username: user.username,
        callbackUrl: url.href,
      }
    );
  }

  async confirmEmail(username: string): Promise<User> {
    const user = await this.db.eq("username", username).single();

    if (!user) {
      throw new Error(`User ${username} not found!`);
    }

    return this.updateUser(user.id, { confirmed: true });
  }

  async sendPasswordRecovery(email: string): Promise<ActionResponse> {
    const result: ActionResponse = { error: null };
    const user: User = await this.getUser(email);

    if (!user) {
      result.error = new AuthException(
        "User not found!",
        AUTH_ERROR_CODE.INVALID_EMAIL_ADDRESS
      );

      return result;
    }

    try {
      await Mailer.sendTemplate(
        user.email,
        "Reset Your Password",
        "password-recovery",
        {
          user,
          passwordResetUrl: await this.getPasswordResetUrl(user.email),
        }
      );

      return result;
    } catch (e) {
      return {
        error: new AuthException(
          "Unexpected Error",
          AUTH_ERROR_CODE.UNEXPECTED_ERROR,
          e as Error
        ),
      };
    }
  }
  async updatePassword(
    email: string,
    newPassword: string,
    passwordConfirmation: string
  ): Promise<ActionResponse<AuthException, User>> {
    const result: ActionResponse<AuthException, User> = {};

    if (newPassword !== passwordConfirmation) {
      result.error = new AuthException(
        "Password and password confirmation must be equal.",
        AUTH_ERROR_CODE.INVALID_PASSWORD
      );
      return result;
    }

    const user = await this.getUser(email);

    if (!user) {
      result.error = new AuthException(
        "The provided email was not found.",
        AUTH_ERROR_CODE.INVALID_EMAIL_ADDRESS
      );
      return result;
    }

    const { data } = await this.authenticate(
      user.username,
      newPassword,
      () => null
    );

    // If it authenticates with the new password, fail as it must be different.
    if (data) {
      result.error = new AuthException(
        "Password must be different than your old password.",
        AUTH_ERROR_CODE.INVALID_PASSWORD
      );
      return result;
    }

    const password = await this.hashPassowrd(newPassword);

    if (password instanceof AuthException) {
      result.error = password;
      return result;
    }

    result.data = await this.updateUser(user.id, {
      password,
    });

    return result;
  }

  async getPasswordResetUrl(email: string): Promise<string> {
    const now = new Date();
    now.setHours(now.getHours() + 1);

    const collections = await this.db.collections();

    if (!_.has(collections, "sent-emails")) {
      await this.db.createCollection("sent-emails");
    }

    const table = this.db.from("sent-emails");

    await table.deleteWhere({ email });

    const record = await table.insert({
      email,
      provider: this.name,
      expire: now.toUTCString(),
    });

    const base = new Buffer(JSON.stringify(record)).toString("base64");

    return `${Server.url}/${ContextConfig.get(
      "auth.views.passwordReset"
    )}?code=${base}&provider=${this.name}`;
  }

  async validateRecoveryCode(
    code: string
  ): Promise<false | { email: string; id: string; expire: string }> {
    try {
      const str = new Buffer(code, "base64").toString("utf-8");
      const obj = JSON.parse(str);

      const record = await this.db.from("sent-emails").get(obj.id);

      if (!record || record.email !== obj.email) {
        return false;
      }

      const expire = new Date(record.expire);

      if (expire < new Date()) {
        return false;
      }

      return record;
    } catch (e) {
      return false;
    }
  }

  async hashPassowrd(password: string): Promise<string|AuthException> {
    // Hash password
    return hash(password, process.env.HOTBARS_AUTH_SECRET || 15)
      .catch(e => {
        logger.warn('Your provided auth secret string (from env var "HOTBARS_AUTH_SECRET") is probably invalid, head to your dashboard to generate a valid secret string and try again.')
        return new AuthException(
          "Error while attempting to salt password",
          AUTH_ERROR_CODE.UNEXPECTED_ERROR,
          e
        );
      });
  }
}
