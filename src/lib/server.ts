import expressWs from "express-ws";
import { Config } from "./config";
import { logger } from "./logger";
import { Router } from "./router";
import { SafeObject } from "../types";
import { Renderer } from "./renderer";

export class Server {
  private readonly config: Config;

  private readonly instance: expressWs.Instance;

  readonly renderer: Renderer;

  readonly router: Router;

  constructor(config: Config, instance: expressWs.Instance) {
    this.config = config;
    this.instance = instance;
    this.renderer = new Renderer(config);
    this.router = new Router(this.config, this.instance, this.renderer);
  }

  configure(instance: expressWs.Instance, data: SafeObject) {
    logger.debug(`Configuring the view's engine...`);

    this.renderer.configure(data);

    instance.app.engine(
      this.config.extname,
      this.renderer.engine.bind(this.renderer)
    );
    instance.app.set("view engine", `.${this.config.extname}`);
    instance.app.set("views", this.config.views);

    this.router.configure();
  }
}
