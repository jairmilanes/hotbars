import * as _ from "lodash";
import express from "express";
import { logger } from "../../../services";
import { loadFile } from "../../services";
import { Env, UserRoutesCallback } from "../../types";
import { Config, EventManager, Server, ServerEvent } from "../../core";
import { replaceRouter } from "../replace";
import { mapRoutes } from "../../utils";

const USER_ROUTE_NAME = "user";

const createRouter = (): express.Router => {
  const createRoutes = loadFile<UserRoutesCallback>(
    Config.relPath("routesConfigName"),
    false,
    [".js", ".cjs"]
  );

  const router = express.Router();

  _.set(router, "_source", USER_ROUTE_NAME);

  if (_.isFunction(createRoutes)) {
    logger.debug(`%p%P from %s`, 5, 0, Config.relPath("routesConfigName"));

    createRoutes(router);
  }

  const userRoutes = mapRoutes(router.stack);

  userRoutes.forEach((route) => {
    route.methods?.forEach((method) => {
      logger.debug(`%p%P [%S]%s`, 5, 0, method, route.path);
    });
  });

  if (!Config.is("env", Env.Prod)) {
    router.get("/_custom", (req, res) =>
      res.jsonp(mapRoutes(Server.app._router.stack))
    );
    logger.debug(`%p%P [GET]/_custom - Get all user routes.`, 5, 0);
  }

  return router;
};

export const createUserRouter = () => {
  logger.debug(`%p%P User custom routes...`, 3, 0);

  const router = createRouter();
  Server.app.use(router);

  EventManager.i.on(ServerEvent.ROUTES_CHANGED, reCreateUserRoutes);
};

export const reCreateUserRoutes = () => {
  logger.log("%P Reloading user routes...", 4);
  replaceRouter(USER_ROUTE_NAME, createRouter());
};
