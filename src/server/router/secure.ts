import * as _ from "lodash";
import { NextFunction, Request, Response } from "express";
import { Config, ContextConfig } from "../core";
import { logger } from "../../services";

export const secureMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (ContextConfig.init(req).enabled("auth")) {
    const config = ContextConfig.init(req);
    const authRoutesMap = config.get<Record<string, any>>("auth.views")
    // need this to include the index page in the check
    const authRoutesValues = Object.values(authRoutesMap)
      .filter(v => v !== "_index" && v !== "_hotbars/_index");

    const isAuthRoute = authRoutesValues
      .some(v => req.originalUrl.indexOf(v) >= 0)

    const isByPassed = ["/_emails"].indexOf(req.url) > -1

    if (!isAuthRoute && !isByPassed) {
      if (!req.isAuthenticated()) {
        return res.redirect(
          config.get<string>("auth.views.signIn")
            .replace("_hotbars/", "")
        );
      }
    }
  }

  next();
};

export const forceConfirmationMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (Config.enabled("auth") && Config.get("auth.confirmEmail")) {
    if (req.isAuthenticated() && !_.get(req.user, "confirmed")) {
      return res.redirect(
        ContextConfig.init(req).get("auth.views.signUpPending")
      );
    }
  }

  next();
};
