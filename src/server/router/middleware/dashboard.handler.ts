/* eslint-disable @typescript-eslint/ban-ts-comment */
import {set} from "lodash"
import * as _ from "lodash";
import express, { Request, Response } from "express";
import { Config, Server, DashboardConfig } from "../../core";
import { logger } from "../../../services";
import { Env } from "../../types";
import { authRoutes } from "./authentication.handler";
import { Controllers } from "../../controllers";
import { secureMiddleware } from "../secure";
import { DataManager } from "../../data";
import { mapPages } from "../../services";
import { RequestHandler } from "express-serve-static-core";

async function buildContext(route: string, view: string, req: Request, res: Response): Promise<Record<string, any>> {
  const context = await Controllers.handle(`/${view}`, view, req, res);

  return {
    isDashboard: true,
    routes: Server.routes,
    dashboard: DashboardConfig.get(),
    ...context
  }
}

const createViewHandler =
  (route: string, routeView: string): RequestHandler =>
    async (req: Request, res: Response) => {

      if (!res.headersSent) {
        const view = DashboardConfig.fullPath("views", routeView);
        const defaultViews = DashboardConfig.fullPath("default_views", routeView);
        const context = await buildContext(route, view, req, res)

        return res.render(view, context, (err, html) => {
          if (err) {
            logger.error(err)
            return res.render(defaultViews, context)
          }
          return res.send(html);
        });
      }
    };

function updateReportTheme(reportHtml: string, theme: string) {
  let html = reportHtml
    .replace("--report-background-color: #fff", "--report-background-color: rgb(229 231 235)")
    .replace("--report-background-color: var(--color-gray-900)", "--report-background-color: rgb(17 24 39)")
    .replace("--report-border-color-secondary: #ebebeb", "--report-border-color-secondary: #d5d5d5")

  if (theme !== "dark") {
    html = html.replace(
      `t.classList.toggle("lh-dark"):t.classList.toggle("lh-dark",e)`,
      `t.classList:t.classList`
    )
  }

  return html
}

async function seoReport(req: Request, res: Response) {
  const { path } = req.params

  if (!path) {
    return res
      .status(400)
      .render("error", {
        message: `Required param "path" missing.`
      })
  }

  try {
    const db = DataManager.get()

    const result = await db
      .from("__lighthouse")
      .eq("path", path)
      .order(["date"], ["desc"])
      .single()

    if (result) {
      const context = await buildContext("/", "", req, res)
      const html = updateReportTheme(result.html, context.settings?.theme)
      return res.send(html)
    }

    return res
      .status(404)
      .render("notFound", {
        message: `Report for path "${path}" could not be found.`
      })
  } catch(e) {
    return res
      .status(500)
      .render("error", { error: e })
  }
}

async function seoPage(req: Request, res: Response) {
  const view = DashboardConfig.fullPath("views", "_seo-report");
  const context = await buildContext(`/${view}`, view, req, res)
  return res.render(view, context)
}

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

export const dashboardHandler = () => {
  const dashboardRouter = express.Router()

  set(dashboardRouter, "_source", "dashboard")

  if (Config.get('env') !== Env.Local) {
    dashboardRouter.get("/emails", async (req: Request, res: Response) =>
      res.redirect("/not-found")
    )
  }

  /* dashboardRouter.all("/", async (req: Request, res: Response) => {
    res.redirect("/_hotbars/_index")
  }); */

  authRoutes(DashboardConfig, dashboardRouter)

  dashboardRouter.get("/_seo/report/:path", seoReport)
  dashboardRouter.get("/_seo-report/:path", seoPage)

  const pages = mapPages(
    DashboardConfig.fullPath("views"),
    DashboardConfig.get("extname"),
    DashboardConfig.get("auth.securePath"),
    (route, view) => {
      logger.info("ROUTE", route, view)
      return createMethodHandlers(
        route,
        dashboardRouter,
        ["get", "post", "patch", "put", "delete"],
        [
          secureMiddleware,
          createViewHandler(route, view)
        ]
      );
    }
  );

  logger.info(pages)

  // dashboardRouter.all("/:serverPage", secureMiddleware, handlePage)

  Server.app.use("/_hotbars", dashboardRouter);
}

