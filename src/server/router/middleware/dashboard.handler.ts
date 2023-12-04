import express, { Request, Response } from "express";
import { Config, Server, DashboardConfig } from "../../core";
import { logger } from "../../../services";
import { Env } from "../../types";
import { authRoutes } from "./authentication.handler";
import { Controllers } from "../../controllers";
import { secureMiddleware } from "../secure";

export const dashboardHandler = () => {
  const dashboardRouter = express.Router();

  if (Config.get('env') !== Env.Dev) {
    dashboardRouter.get("/emails", async (req: Request, res: Response) =>
      res.redirect("/not-found")
    );
  }

  dashboardRouter.all("/", async (req: Request, res: Response) => {
    res.redirect("/_hotbars/_index");
  });

  authRoutes(DashboardConfig, dashboardRouter);

  dashboardRouter.all("/:serverPage", secureMiddleware, async (req: Request, res: Response) => {
    const { serverPage } = req.params;
    const prefixedName = serverPage.startsWith("_")
      ? serverPage
      : `_${serverPage}`;

    logger.info("%p%P DashboardHandler", 1, 1, prefixedName)

    // use absolute path for dashboard views
    const view = DashboardConfig.fullPath("views", prefixedName);
    const defaultViews = DashboardConfig.fullPath("default_views", prefixedName);
    const context = await Controllers.handle(`/${view}`, view, req, res);

    const options = {
      lang: "en",
      url: req.url,
      ...req.query,
      ...req.params,
      routes: Server.routes,
      dev: Config.get("dev"),
      config: Config.get(),
      dashboard: DashboardConfig.get(),
      ...context
    }

    return res.render(view, options, (err, html) => {
      if (err) {
        logger.error(err)
        return res.render(defaultViews, options)
      }

      return res.send(html);
    });
  });

  Server.app.use("/_hotbars", dashboardRouter);

  logger.debug("%p%P Hotbars dashboard", 3, 0);
  logger.debug("%p%P [GET]/_hotbars/:serverPage", 5, 0);
};

