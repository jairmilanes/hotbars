import express, { NextFunction, Request, Response } from "express";
import { Config, Server, DashboardConfig } from "../../core";
import { logger } from "../../../services";
import { joinPath } from "../../utils";

export const dashboardHandler = () => {
  const dashboardRouter = express.Router();

  dashboardRouter.param(
    "serverPage",
    (req: Request, res: Response, next: NextFunction) => {
      if (req.url.startsWith("/_hotbars") && !req.params.serverPage) {
        req.params.serverPage = "index";
      }
      next();
    }
  );

  dashboardRouter.get("/:serverPage", async (req: Request, res: Response) => {
    const { serverPage } = req.params;
    const prefixedName = serverPage.startsWith("_")
      ? serverPage
      : `_${serverPage}`;
    // use absolute path for dashboard views
    const absolute = DashboardConfig.fullPath("views", prefixedName);

    return res.render(absolute, {
      lang: "en",
      url: req.url,
      ...req.query,
      ...req.params,
      routes: Server.routes,
      config: Config.get(),
      dashboard: DashboardConfig.get(),
    });
  });

  Server.app.use("/_hotbars", dashboardRouter);

  logger.debug("%p%P Hotbars dashboard", 3, 0);
  logger.debug("%p%P [GET]/_hotbars/:serverPage", 5, 0);
};
