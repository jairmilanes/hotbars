/* eslint-disable @typescript-eslint/ban-ts-comment */
import * as _ from "lodash";
import { NextFunction, Request, Response } from "express";
import { logger } from "../../../services";
import { Server } from "../../core";

const logg = (req: Request) => {
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

  const params = _.assign(
    {},
    { ...req.params },
    { ...req.query },
    { ...req.body }
  );

  if (!_.isEmpty(params)) {
    logger.method.params(params);
  }
};

export const requestLoggerHandler = () => {
  Server.app.use((req: Request, res: Response, next: NextFunction) => {
    const methods = ["end"];
    // const chunks = [];

    /* res.write = _.wrap(res.write, function(fn, ...args) {
      chunks.push(new Buffer(args[0]));
      // @ts-ignore
      return fn.apply(res, args);
    }); */

    _.forEach(methods, (method) =>
      _.set(
        res,
        method,
        _.wrap(_.get(res, method), function (fn, ...args) {
          logg(req);
          return fn.call(res, ...args);
        })
      )
    );

    next();
  });
};
