/* eslint-disable @typescript-eslint/no-explicit-any */
import { Strategy } from "passport";
import { Response } from "express";
import { Server } from "../../core";
import { User } from "../../types";
import { Mailer } from "../../services";
import { logger } from "../../../services";

export abstract class StrategyAbstract {
  name;

  failureRedirect = "/sign-in";

  successRedirect = "/";

  protected INVALID_CREDENTIALS = "invalid_credentials";
  protected AUTH_ERROR = "auth_error";

  protected constructor(
    name: string,
    successRedirect?: string,
    failureRedirect?: string
  ) {
    if (!name) {
      throw new Error("Please set your auth strategy name identifier.");
    }

    this.name = name;

    if (successRedirect) this.successRedirect = successRedirect;

    if (failureRedirect) this.failureRedirect = failureRedirect;
  }

  abstract createStrategy(): Strategy;

  abstract configure(): { [key: string]: any };

  abstract authenticate(...args: any[]): Promise<void>;

  abstract createUser(...args: any[]): Promise<User>;

  abstract confirmEmail(...args: any[]): Promise<User>;

  async sendEmailConfirmation(user: User, provider: string) {
    const url = new URL("/sign-up/confirm", Server.url);
    url.searchParams.append("username", user.username);
    url.searchParams.append("provider", provider);

    logger.debug(`Sending email to %s`, user.email);

    await Mailer.sendTemplate(user.email, "sign-up-confirmation", {
      username: user.username,
      callbackUrl: url.href,
    });
  }

  handleResponse(res: Response, error?: boolean, user?: any): void {
    if (error) return res.redirect(this.getFailureUrl(true));
    if (!user) return res.redirect(this.getFailureUrl());
    return res.redirect(this.successRedirect);
  }

  getFailureUrl(error?: boolean) {
    return `${Server.url}${this.failureRedirect}?error=${
      error ? this.AUTH_ERROR : this.INVALID_CREDENTIALS
    }`;
  }

  getCallbackUrl(): string {
    return `${Server.url}/auth/${this.name}/callback`;
  }
}
