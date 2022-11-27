import * as _ from "lodash";
import { NextFunction, Request, Response } from "express";
import { Config } from "../core";

export const secureMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (Config.enabled("auth")) {
    if (!req.isAuthenticated()) {
      return res.redirect(`/sign-in`);
    }
  }

  next();
};

export const forceConfirmationMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (Config.enabled("auth")) {
    if (req.isAuthenticated() && !_.get(req.user, "confirmed")) {
      return res.redirect("/sign-up/pending");
    }
  }

  next();
};
