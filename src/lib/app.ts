import open from "open";
import { joinPath } from "./utils";
import {
  Browser,
  WatcherChange,
  WatcherChangeType,
  WatcherEvent,
  CliOptions,
} from "../types";
import { logger, BootstrapData, compileSass } from "./services";
import {
  Server,
  Config,
  Controllers,
  Renderer,
  PreRenderer,
  Watcher,
  Router,
} from "./core";

export class App {
  readonly watcher: Watcher;

  readonly renderer: Renderer;

  readonly preRenderer: PreRenderer;

  readonly router: Router;

  private initialized = false;

  closing = false;

  constructor() {
    this.watcher = new Watcher();
    this.renderer = new Renderer();
    this.preRenderer = new PreRenderer();
    this.router = new Router(this.renderer, this.preRenderer);
  }

  async start(): Promise<this> {
    logger.info(`Configuring server...`);

    await BootstrapData.load();
    await Controllers.load();

    this.sass();

    this.renderer.configure();
    this.preRenderer.configure();

    Server.create(this.renderer);

    this.router.configure();

    this.watcher.on(WatcherEvent.All, this.reConfigure.bind(this));

    this.watcher.on(WatcherEvent.Broadcast, this.broadcast.bind(this));

    this.watcher.watch(async () => {
      if (!this.initialized) {
        await Server.listen();

        logger.info(`Hot reload server listening at ${Server.url}`);

        await this.launch();
        this.initialized = true;
      }
    });

    return this;
  }

  async close(force?: boolean): Promise<number> {
    this.closing = true;
    logger.info(force ? "Forcefully shutting down..." : "Shutting down...");

    await this.watcher.close();
    logger.debug("-- Watcher down");

    try {
      await Server.get().close(force);
      this.closing = false;
      process.exit(0);
    } catch (error) {
      logger.error(
        "Failed to gracefully shut down all server components",
        error
      );
      this.closing = false;
      process.exit(1);
    }
  }

  private async reConfigure(eventType: WatcherEvent, change: WatcherChange) {
    if (change.type === WatcherChangeType.Scss) {
      this.sass();
    }

    if (change.type === WatcherChangeType.Routes) {
      this.router.user(true);
    }

    if (change.structural && change.type === WatcherChangeType.Page) {
      this.router.pages(true);
    }

    if (change.type === WatcherChangeType.Controller) {
      await Controllers.load();
    }

    if (change.type === WatcherChangeType.File) {
      this.renderer.configure();
    }
  }

  private broadcast(type: WatcherEvent, change: WatcherChange) {
    const { clients } = Server.ws;

    logger.debug(`-- Broadcasting to ${clients.size} clients...`);

    clients.forEach((ws) => {
      if (ws) {
        ws.send(JSON.stringify({ type, file: change.path }), (error) => {
          if (error) {
            logger.error("Websocket error:", error);
          }
        });
      }
    });

    logger.debug("All WS clients have been updated.");
  }

  private async launch(): Promise<void> {
    if (Server.url) {
      const targetBrowser = Config.value<Browser>("browser");

      logger.info(`Launching application with: ${targetBrowser}...`);

      await open(Server.url, { app: { name: targetBrowser } });
    }
  }

  private sass() {
    if (Config.get("styleMode") === "scss") {
      compileSass(
        Config.relPath("styles"),
        joinPath(Config.relPath("public"), Config.value<string>("styles")),
        Config.value<string>("root"),
        Config.get("env")
      );
    }
  }
}
