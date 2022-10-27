import expressWs from "express-ws";
import { Config } from "./config";
import { logger } from "./logger";
import { Router } from "./router";
import { Watcher } from "./watcher";
import { WatcherChange, WatcherChangeType, WatcherEventType } from "../types";
import { Renderer } from "./renderer";

export class Server {
  private readonly config: Config;

  private readonly router: Router;

  private readonly instance: expressWs.Instance;

  private readonly watcher: Watcher;

  private readonly renderer: Renderer;

  constructor(config: Config, instance: expressWs.Instance, watcher: Watcher) {
    this.config = config;
    this.instance = instance;
    this.watcher = watcher;
    this.renderer = new Renderer(config);
    this.router = new Router(this.config, this.instance, this.renderer);
  }

  configure(instance: expressWs.Instance) {
    logger.debug(`Configuring the view's engine...`);

    instance.app.engine(
      this.config.extname,
      this.renderer.engine.bind(this.renderer)
    );
    instance.app.set("view engine", `.${this.config.extname}`);
    instance.app.set("views", this.config.views);

    this.router.configure();

    this.watcher.on(WatcherEventType.Changed, (change: WatcherChange) => {
      if (change.type === WatcherChangeType.Routes) {
        this.router.configure();
      }
    });
  }
}
