/* eslint-disable @typescript-eslint/ban-ts-comment */
import * as _ from "lodash";
import express, { Request, Response } from "express";
import { RequestHandler } from "express-serve-static-core";
import { logger } from "../../../services";
import { Config, DashboardConfig, EventManager, Server, ServerEvent } from "../../core";
import { mapPages } from "../../services";
import { Controllers } from "../../controllers";
import { AutoRouteConfig, Env } from "../../types";
import { forceConfirmationMiddleware, secureMiddleware } from "../secure";
import { replaceRouter } from "../replace";

const createMethodHandlers = (
  route: string,
  router: express.Router,
  methods: string | string[],
  middlewares: RequestHandler[]
) => {
  const allowed = ["get", "post", "patch", "put", "delete"];
  if (_.isArray(methods)) {
    _.forEach(methods, (method) => {
      if (_.includes(allowed, method.toLowerCase())) {
        // @ts-ignore
        _.invoke(router, method, route, ...middlewares);
      } else {
        logger.debug(`%p%P method [%S] is not allowed, skipped.`, 5, 0, method);
      }
    });
  } else if (methods === "*") {
    router.all(route, ...middlewares);
  } else if (_.isFunction(_.get(router, methods))) {
    _.invoke(router, methods, route, ...middlewares);
  }
};

const createViewHandler =
  (route: string, view: string): RequestHandler =>
  async (req: Request, res: Response) => {
    const context = await Controllers.handle(route, view, req, res);

    if (!res.headersSent) {
      res.status(200).render(view, context);
    }
  };

const getMiddlewares = (route: string, view: string) => {
  const middlewares: RequestHandler[] = [];

  // Add authentication check middleware if route is secure
  if (_.startsWith(view, `${Config.get("auth.securePath")}`)) {
    middlewares.push(forceConfirmationMiddleware);
    middlewares.push(secureMiddleware);
  }

  middlewares.push(createViewHandler(route, view));

  return middlewares;
};

const createRouter = () => {
  const pagesRouter = express.Router();

  _.set(pagesRouter, "_source", "pages");

  const config = Config.value<AutoRouteConfig>("autoroute");

  const pages = mapPages(
    Config.relPath("views"),
    Config.get("extname"),
    Config.get("auth.securePath"),
    (route, view) => {
      return createMethodHandlers(
        route,
        pagesRouter,
        config[view] || config.methods,
        getMiddlewares(route, view)
      );
    }
  );

  if (!Config.is("env", Env.Prod)) {
    Server.app.get("/_views", (req, res) => res.json(pages));
  }

  return pagesRouter;
};

export const generateViewHandlers = () => {
  Server.app.use(createRouter());

  EventManager.i.on(ServerEvent.VIEWS_CHANGED, reGenerateViewHandlers);
};

export const reGenerateViewHandlers = () => {
  replaceRouter("pages", createRouter());
};
