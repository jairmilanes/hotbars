/* eslint-disable @typescript-eslint/no-explicit-any */
import { Strategy } from "passport";
import { Response } from "express";
import { Server } from "../../core";

export abstract class StrategyAbstract {
  name;

  failureRedirect = "/sign-in";

  successRedirect = "/";

  protected INVALID_CREDENTIALS = "invalid_credentials";
  protected AUTH_ERROR = "auth_error";

  protected constructor(name: string) {
    if (!name) {
      throw new Error("Please set your auth strategy name identifier.");
    }

    this.name = name;
  }

  abstract createStrategy(): Strategy;

  abstract configure(): { [key: string]: any };

  abstract authenticate(...args: any[]): Promise<void>;

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
