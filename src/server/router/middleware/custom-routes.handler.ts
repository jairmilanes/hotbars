import * as _ from "lodash";
import express from "express";
import { logger } from "../../../services";
import { loadFile } from "../../services";
import { Env, UserRoutesCallback, WatcherChange } from "../../types";
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

  if (!Config.is("env", Env.Prod)) {
    router.get("/_custom", (req, res) =>
      res.jsonp(mapRoutes(Server.app._router.stack))
    );
  }

  return router;
};

export const createUserRouter = () => {
  const router = createRouter();
  Server.app.use(router);

  EventManager.i.on(ServerEvent.ROUTES_CHANGED, reCreateUserRoutes);
};

export const reCreateUserRoutes = (data?: WatcherChange) => {
  logger.log("%P Reloading user routes...", 4);
  replaceRouter(USER_ROUTE_NAME, createRouter());

  if (data) {
    EventManager.i.emit(ServerEvent.HOT_RELOAD, data);
  }
};
