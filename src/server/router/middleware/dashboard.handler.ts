import { NextFunction, Request, Response } from "express";
import { Config, Server } from "../../core";
import { getServerViewPath } from "../../utils/server-view-path";
import { logger } from "../../../services";

export const dashboardHandler = () => {
  Server.app.param(
    "serverPage",
    (req: Request, res: Response, next: NextFunction) => {
      if (req.url.startsWith("/_hotbars") && !req.params.serverPage) {
        req.params.serverPage = "index";
      }
      next();
    }
  );

  Server.app.get(
    "/_hotbars/:serverPage",
    async (req: Request, res: Response, next: NextFunction) => {
      const viewPath = getServerViewPath(req.params.serverPage);

      if (!viewPath) {
        return next();
      }

      return res.render(viewPath, {
        url: req.url,
        ...req.query,
        ...req.params,
        config: Config.get(),
      });
    }
  );

  logger.debug("%p%P Hotbars dashboard", 3, 0);
  logger.debug("%p%P [GET]/_hotbars/:serverPage", 5, 0);
};
