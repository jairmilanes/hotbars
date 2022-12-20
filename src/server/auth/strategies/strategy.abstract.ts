/* eslint-disable @typescript-eslint/no-explicit-any */
import { Strategy } from "passport";
import { Response } from "express";
import { Config, Server } from "../../core";
import { User } from "../../types";

export abstract class StrategyAbstract {
  name;

  failureRedirect: string;

  successRedirect?: string;

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

    this.successRedirect = successRedirect || `/`;

    this.failureRedirect =
      failureRedirect || `/${Config.get("auth.views.signIn")}`;
  }

  abstract createStrategy(): Strategy;

  abstract configure(): { [key: string]: any };

  abstract authenticate(...args: any[]): Promise<any>;

  abstract getUser(username: string): Promise<User>;

  /**
   * @throws {Error}
   */
  abstract createUser(...args: any[]): Promise<User|never>;

  abstract updateUser(...args: any[]): Promise<User>;

  getFailureUrl(error?: boolean) {
    return `${Server.url}${this.failureRedirect}?error=${
      error ? this.AUTH_ERROR : this.INVALID_CREDENTIALS
    }`;
  }

  getCallbackUrl(): string {
    return `${Server.url}/${Config.get("auth.views.signIn")}/${
      this.name
    }/callback`;
  }
}
