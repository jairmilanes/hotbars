import express, { Request, Response } from "express";
import expressWs, { Application } from "express-ws";
import cors from "cors";
import { joinPath } from "../utils/path";
import { mapEndpoints } from "../utils/endpoint-mapper";
import { Config, loadConfig } from "./config";
import { logger } from "./logger";
import { Renderer } from "./renderer";
import { RouteManager } from "./route-manager";
import { RequestError, UserRoutesCallback } from "../types";
import { UploadsManager } from "./uploads-manager";

export class Router {
  private readonly config: Config;

  private readonly instance: expressWs.Instance;

  private readonly app: Application;

  private readonly renderer: Renderer;

  private readonly manager: RouteManager;

  private readonly notFoundView: string;

  private readonly errorView: string;

  constructor(
    config: Config,
    instance: expressWs.Instance,
    renderer: Renderer
  ) {
    this.config = config;
    this.instance = instance;
    this.app = instance.app;
    this.renderer = renderer;
    this.manager = new RouteManager(this.app, config);
    this.notFoundView = joinPath(this.config.serverViews, `notFound.hbs`);
    this.errorView = joinPath(this.config.serverViews, `error.hbs`);
  }

  configure(): void {
    logger.info(`Configuring routes...`);

    this.manager.clear(this.app._router?.stack);

    if (this.config.cors.enabled) {
      this.app.use(cors());
      logger.debug("-- CORS has been enabled");
    }

    this.app.use(express.json());
    // this.app.use(express.urlencoded());
    this.app.use(express.raw());

    this.logger();
    this.static();

    this.form();

    this.user();
    this.manager.generate();
    this.partial();
    this.preCompiler();
    this.socket();
    this.notFound();
    this.error();
    this.fallBack();
    this.errorHandler();

    const routeMap = mapEndpoints(this.app._router?.stack);

    logger.file(routeMap);
  }

  private static(): void {
    this.app.use(
      "/hhr-scripts",
      express.static(`${this.config.serverScripts}/`)
    );
    this.app.use("/hhr-styles", express.static(`${this.config.serverStyles}/`));
    this.app.use(
      "",
      express.static(`${joinPath(this.config.source, this.config.public)}/`)
    );
  }

  private logger(): void {
    this.app.use((req, res, next) => {
      logger.request(
        `${req.xhr ? `XHR:` : ""}${req.method.toUpperCase()}:${req.url}`,
        req.params
      );
      next();
    });
  }

  private user(): void {
    const userRoutesCallback = loadConfig<UserRoutesCallback>(
      joinPath(this.config.source, this.config.routesConfigName),
      this.config.moduleName
    );

    if (userRoutesCallback && typeof userRoutesCallback === "function") {
      logger.debug(`Adding user routes...`);
      userRoutesCallback(this.app, express.Router, this.config);
    }
  }

  private form(): void {
    const uploads = new UploadsManager(this.config);

    this.app.get("/_form/*", uploads.configure(), async (req, res, next) => {
      next();
    });
  }

  private preCompiler(): void {
    this.app.get("/precompiled", async (req, res) => {
      const code = await this.renderer.preRender();
      res.status(200).type(".js").send(code);
    });
  }

  private partial(): void {
    this.app.get("/partial/:partialId", (req, res) => {
      res.status(200).render(req.params.partialId, req.params);
    });
  }

  private notFound() {
    this.app.get("/not-found", async (req, res) => {
      return this.renderError("notFound", this.notFoundView, req, res);
    });
  }

  private error() {
    this.app.get("/error", async (req, res) => {
      return this.renderError("error", this.errorView, req, res);
    });
  }

  private socket(): void {
    this.app.ws("/ws/_connect", (ws) => {
      this.instance.getWss().clients.add(ws);
      logger.debug(
        "Socket client connected",
        this.instance.getWss().clients.size
      );

      ws.on("close", () => {
        this.instance.getWss().clients.delete(ws);
        logger.debug(
          "Socket client disconnected",
          this.instance.getWss().clients.size
        );
      });
    });
  }

  private fallBack() {
    this.app.use("*", async (req, res) => {
      logger.info(`No matches found for "${req.url}"`);

      res.status(404);

      return this.renderError("notFound", this.notFoundView, req, res);
    });
  }

  private errorHandler(): void {
    this.app.use(async (err: RequestError, req: Request, res: Response) => {
      if (err.view) {
        // @todo Are we sure if there is an .view it means it was not found?
        logger.debug(`View "${err.view.name}" not found`);

        res.status(404);

        return this.renderError("notFound", this.notFoundView, req, res);
      }

      logger.error("Request error:", err);

      res.status(500);

      return this.renderError("error", this.errorView, req, res);
    });
  }

  private async renderError(
    errorName: string,
    fallback: string,
    req: Request,
    res: Response
  ): Promise<void> {
    if (this.manager.hasUserView(errorName)) {
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
}
