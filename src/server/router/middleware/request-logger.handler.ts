import * as _ from "lodash";
import { NextFunction, Request, Response } from "express";
import { logger } from "../../../services";
import { Server } from "../../core";

const lodRequest = (req: Request, res: Response, next: NextFunction) => {
  let log = "";

  if (req?.isAuthenticated && req.isAuthenticated()) {
    log += _.get(req.user, "username");
    log += " => ";
  }

  if (req.xhr) {
    log += "XHR:";
  }

  log += req.url;

  _.invoke(logger.method, req.method.toLowerCase(), log);

  const params = _.assign({}, req.params, req.query);

  if (!_.isEmpty(params)) {
    logger.method.params(params);
  }

  next();
};

export const requestLoggerHandler = () => {
  Server.app.use(lodRequest);
  logger.debug("%p%P Request logger", 3, 0);
};
