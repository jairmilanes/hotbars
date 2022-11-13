import { existsSync } from "fs";
import express, { Request, Response } from "express";
import { RequestHandler } from "express-serve-static-core";
import expressWs from "express-ws";
import cors from "cors";
import jsonRouter from "json-server";
import apicache from "apicache";
import {
  RequestError,
  RouteMap,
  SafeObject,
  UserRoutesCallback,
  CorsConfig,
  AutoRouteConfig,
} from "../../types";
import {
  joinPath,
  mapRoutes,
  mapDatabase,
  loadFile,
  mapPages,
  isObject,
} from "../utils";
import { Multipart, logger } from "../services";
import { Config, Server, Controllers, Renderer, PreRenderer } from ".";

export class Router {
  private readonly renderer: Renderer;

  private readonly preRenderer: PreRenderer;

  private readonly cache = apicache.middleware;

  private userPages: SafeObject = {};

  private routes: RouteMap[] = [];

  constructor(renderer: Renderer, preRenderer: PreRenderer) {
    this.renderer = renderer;
    this.preRenderer = preRenderer;
  }

  configure(): void {
    logger.info(`Configuring routes...`);

    if (Config.value<CorsConfig>("cors").enabled) {
      Server.app.use(cors({ origin: true, credentials: true }));
      logger.debug("-- CORS has been enabled");
    }

    Server.app.use(
      express.urlencoded({
        extended: true,
      })
    );
    Server.app.use(express.json());
    Server.app.use(express.raw());

    this.logger();
    this.static();
    this.form();
    this.api();
    this.partial();
    this.preCompiler();
    this.socket();
    this.notFound();
    this.error();
    this.pages();
    this.user();
    this.dashboard();
    this.fallBack();
    this.errorHandler();

    this.routes = mapRoutes(Server.app._router?.stack);
  }

  private static(): void {
    const {
      serverScripts,
      serverStyles,
      source,
      public: publicDir,
    } = Config.get();
    Server.app.use(
      "/hhr-scripts",
      express.static(`${serverScripts}/`, { cacheControl: true, maxAge: "3h" })
    );
    Server.app.use("/hhr-styles", express.static(`${serverStyles}/`));
    Server.app.use("", express.static(`${joinPath(source, publicDir)}/`));
  }

  private logger(): void {
    Server.app.use((req, res, next) => {
      logger.request(
        `${req.xhr ? `XHR:` : ""}${req.method.toUpperCase()}:${req.url}`,
        req.params
      );
      next();
    });
  }

  private form(): void {
    const uploads = new Multipart();
    const middleware = uploads.configure();
    Server.app.post("/*", middleware);
    Server.app.patch("/*", middleware);
    Server.app.put("/*", middleware);
  }

  pages(recreate?: boolean): void {
    const pagesRouter = express.Router();

    if (recreate) {
      logger.debug("Reloading page routes...");
    }

    const config = Config.value<AutoRouteConfig>("autoroute");

    /* eslint-disable */
    this.userPages = mapPages(
      Config.relPath("views"),
      Config.get("extname"),
      (route, view) => {
        const viewRouteConfig = config[view] || config.methods;

        if (Array.isArray(viewRouteConfig)) {
          viewRouteConfig
            .filter(
              (method) =>
                ["get", "post", "patch", "put", "delete"].indexOf(
                  method.toLowerCase()
                ) > -1
            )
            .forEach((method) => {
              // @ts-ignore
              pagesRouter[method](route, this.handleViewRequest(view));
            });
        } else if (viewRouteConfig === "*") {
          // @ts-ignore
          pagesRouter.all(route, this.handleViewRequest(view));
        }
      }
    );

    // @ts-ignore
    pagesRouter._source = "pages";

    if (!recreate) {
      Server.app.use(pagesRouter);
    } else {
      this.replaceRouter("user", pagesRouter);
    }
    /* eslint-enable */
  }

  private handleViewRequest(view: string): RequestHandler {
    return async (req: Request, res: Response) => {
      const result = await Controllers.call(view, req, res);

      res.status(200).render(view, {
        url: req.url,
        query: { ...req.query },
        params: { ...req.params },
        secure: req.secure,
        xhr: req.xhr,
        ...(isObject(result) ? result : {}),
      });
    };
  }

  user(recreate?: boolean): void {
    const userRoutesCallback = loadFile<UserRoutesCallback>(
      Config.relPath("routesConfigName"),
      false,
      [".js", ".cjs"]
    );

    if (recreate) {
      logger.debug("Reloading user routes...");
    }

    if (userRoutesCallback && typeof userRoutesCallback === "function") {
      const userRouter = express.Router();

      logger.debug(
        `-- Custom routes found at ${Config.relPath("routesConfigName")}..`
      );

      userRoutesCallback(userRouter, Config.get());

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      userRouter._source = "user";

      if (!recreate) {
        Server.app.use(userRouter);
      } else {
        this.replaceRouter("user", userRouter);
      }
    }
  }

  private api() {
    if (Config.value<string>("jsonDb")) {
      const apiRouter = jsonRouter.router(mapDatabase(Config.get()));

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      apiRouter._source = "json-db";

      Server.app.use("/_api", apiRouter);
    }
  }

  private preCompiler(): void {
    Server.app.get("/_precompiled", async (req, res) => {
      const code = await this.preRenderer.preRender(
        (req.header("referer") || "").indexOf("/_hotbars") > -1
      );

      res.status(200).type(".js").send(code);
    });
  }

  private partial(): void {
    Server.app.get("/_partial/:partialId", (req, res) => {
      res.status(200).render(req.params.partialId, req.params);
    });
  }

  private dashboard() {
    Server.app.param("serverPage", (req, res, next) => {
      if (req.url.startsWith("/_hotbars") && !req.params.serverPage) {
        req.params.serverPage = "index";
      }
      next();
    });

    Server.app.get("/_hotbars/:serverPage", async (req, res, next) => {
      if (!existsSync(this.serverView(req.params.serverPage))) {
        return next();
      }
      return this.handleServerPage(req.params.serverPage, req, res);
    });
  }

  private notFound() {
    Server.app.get("/not-found", async (req, res) => {
      return this.renderError(
        "notFound",
        this.serverView("notFound"),
        req,
        res
      );
    });
  }

  private error() {
    Server.app.get("/error", async (req, res) => {
      return this.renderError("error", this.serverView("error"), req, res);
    });
  }

  private socket(): void {
    Server.app.ws("/ws/_connect", (ws) => {
      Server.ws.clients.add(ws);

      logger.debug("Hot reload client added.", Server.ws.clients.size);

      ws.on("close", () => {
        Server.ws.clients.delete(ws);
        logger.debug("Hot reload client disconnected", Server.ws.clients.size);
      });
    });
  }

  private fallBack() {
    Server.app.use("*", async (req, res) => {
      logger.info(`No matches found for "${req.url}"`);

      res.status(404);

      return this.renderError(
        "notFound",
        this.serverView("notFound"),
        req,
        res
      );
    });
  }

  private errorHandler(): void {
    Server.app.use(async (err: RequestError, req: Request, res: Response) => {
      if (err.view) {
        // @todo Are we sure if there is an .view it means it was not found?
        logger.warn(`View "${err.view.name}" not found`);

        res.status(404);

        return this.renderError("notFound", this.serverView("error"), req, res);
      }

      logger.error("Request error:", err);

      res.status(500);

      return this.renderError("error", this.serverView("error"), req, res);
    });
  }

  private serverView(name: string) {
    const prefixedName = name.startsWith("_") ? name : `_${name}`;
    return joinPath(Config.get("serverViews"), `${prefixedName}.hbs`);
  }

  private async handleServerPage(view: string, req: Request, res: Response) {
    const html = await this.renderer.render(this.serverView(view), {
      user: req.url,
      ...req.query,
      ...req.params,
      routes: this.routes,
      config: Config.get(),
    });

    res.status(200).send(html);
  }

  private async renderError(
    errorName: string,
    fallback: string,
    req: Request,
    res: Response
  ): Promise<void> {
    if (this.hasUserView(errorName)) {
      res.render(errorName);
    } else {
      const html = await this.renderer.render(fallback, {
        user: req.url,
        ...req.query,
        ...req.params,
      });
      res.status(404).send(html);
    }
  }

  private replaceRouter(type: string, router: expressWs.Router) {
    Server.app._router?.stack.forEach((layer: any) => {
      if (layer?.handle._source === type) {
        layer.handle = router;
      }
    });
  }

  hasUserView(name: string): boolean {
    return (
      Object.keys(this.userPages).find(
        (path) => this.userPages[path] === name
      ) !== undefined
    );
  }
}
