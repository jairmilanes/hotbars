import { existsSync } from "fs";
import express, { NextFunction, Request, Response } from "express";
import { RequestHandler } from "express-serve-static-core";
import expressWs from "express-ws";
import session, { SessionOptions } from "express-session";
import cors from "cors";
import jsonRouter from "json-server";
import apicache from "apicache";
import passport from "passport";
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
import { AuthManager } from "../auth";
import { DataManager } from "../data";

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

  async configure(): Promise<void> {
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
    this.session();
    this.authenticate();
    this.form();
    await this.api();
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

  private session() {
    const sessionConfig: SessionOptions = {
      secret: "keyboard cat",
      saveUninitialized: true,
      resave: true,
      cookie: {
        secure: false,
        maxAge: 60 * 60 * 1000,
      },
    };

    if (Config.get("env") === "production") {
      Server.app.set("trust proxy", 1); // trust first proxy

      sessionConfig.saveUninitialized = true;

      if (!sessionConfig.cookie) {
        sessionConfig.cookie = {};
      }

      sessionConfig.cookie.secure = true; // serve secure cookies
    }

    Server.app.use(session(sessionConfig));
  }

  private authMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    const provider = req.params.provider;

    if (AuthManager.has(provider)) {
      const instance = AuthManager.get(provider);

      return passport.authenticate(instance.name, instance.configure())(
        req,
        res,
        next
      );
    }

    next(
      new Error(
        `Provider ${provider} not found, please check your configuration and try again.`
      )
    );
  }

  private secureRoute(req: Request, res: Response, next: NextFunction) {
    if (!req.isAuthenticated()) {
      return res.redirect(`/sign-in`);
    }
    next();
  }

  private authenticate() {
    if (!Config.enabled("auth")) {
      return;
    }

    Server.app.use(passport.initialize());
    Server.app.use(passport.session());

    Server.app.get(`/sign-in`, (req, res) => {
      if (req.isAuthenticated()) {
        return res.redirect("/");
      }
      return res.render("sign-in");
    });

    Server.app.post(`/sign-out`, (req, res, next) => {
      if (req.isAuthenticated()) {
        return req.logout((err) => {
          if (err) return next(err);
          res.redirect("/");
        });
      }
      return res.redirect("/");
    });

    const authMiddleware = this.authMiddleware.bind(this);

    // Authentication endpoint
    Server.app.post(`/auth/:provider`, authMiddleware);

    // OAuth2 callback endpoint
    Server.app.get(`/auth/:provider/callback`, authMiddleware);
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
      Config.get("securePath"),
      (route, view) => {
        const viewRouteConfig = config[view] || config.methods;
        const middlewares: any[] = [route];

        // Add authentication check middleware if route is secure
        if (view.indexOf(`/${Config.get("auth.securePath")}`) > -1) {
          middlewares.push(this.secureRoute.bind(this));
        }

        middlewares.push(this.handleViewRequest(view));

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
              pagesRouter[method](...middlewares);
            });
        } else if (viewRouteConfig === "*") {
          // @ts-ignore
          pagesRouter.all(...middlewares);
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
      logger.info(
        "Testing authentication",
        req.isAuthenticated,
        req.isAuthenticated && req.isAuthenticated(),
        req.user
      );
      res.status(200).render(view, {
        url: req.url,
        query: { ...req.query },
        params: { ...req.params },
        secure: req.secure,
        authenticated: req.isAuthenticated && req.isAuthenticated(),
        user: req.user,
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

      userRoutesCallback(userRouter);

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

  private async api() {
    const jsonDbPath = Config.value<string>("jsonDb");

    if (jsonDbPath) {
      const apiRouter = jsonRouter.router<any>(
        (() => {
          if (jsonDbPath.endsWith(".json")) {
            logger.info("Loading LowDb from", Config.relPath("jsonDb"));
            return Config.relPath("jsonDb");
          }
          logger.info("Loading LowDb into memory");
          return mapDatabase(Config.get()).db;
        })()
      );

      await DataManager.create("lowDb", apiRouter.db);

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
