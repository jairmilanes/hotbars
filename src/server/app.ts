import open from "open";
import { logger } from "../services";
import { Browser, Env } from "./types";
import {
  BootstrapData,
  Mailer,
  SassCompiler,
  BrowserifyCompiler,
} from "./services";
import {
  Server,
  Config,
  Renderer,
  Watcher,
  EventManager,
  ServerEvent,
  PreRenderer,
  DashboardConfig,
} from "./core";
import { Router } from "./router";
import { AuthManager } from "./auth";
import { DataManager } from "./data";
import { Controllers } from "./controllers";
import { FakeSMPTServer } from "./smtp";

export class App {
  readonly watcher?: Watcher;
  readonly dashboardWatcher?: Watcher;

  readonly router: Router;

  closing = false;

  constructor() {
    logger.log(`Initializing ${Config.get("env")} server:`);

    if (Config.enabled("language")) {
      logger.info("%p%P Languages enabled", 1, 1);
      logger.info(`%p%P defaults to %s`, 3, 0, Config.get("currentLanguage"));
    }

    EventManager.create();
    Controllers.create();
    Renderer.create();
    PreRenderer.create();
    Mailer.create();
    AuthManager.create();
    FakeSMPTServer.create();
    BrowserifyCompiler.create();
    SassCompiler.create();

    if (Config.is("env", Env.Dev)) {
      this.watcher = new Watcher(Config.get());
    }

    if (DashboardConfig.get("dev")) {
      this.dashboardWatcher = new Watcher(DashboardConfig.get());
    }

    Server.create();

    this.router = new Router();
  }

  async start(): Promise<void> {
    logger.info(`Botstraping:`);

    await BootstrapData.load();
    await Controllers.load();
    await AuthManager.load();

    if (Config.get("jsonDb")) {
      await DataManager.create("jsonDb");
    }

    if (Config.is("env", Env.Dev)) {
      SassCompiler.compile();

      await BrowserifyCompiler.compileUserRuntime();
      await BrowserifyCompiler.compileDashboardRuntime();
    }

    this.router.configure();

    EventManager.i.emit(ServerEvent.INIT);

    await this.watcher?.start();
    await this.dashboardWatcher?.start();

    // SMTP Server only works in dev
    if (Config.is("env", Env.Dev) && Config.enabled("smtpServer")) {
      FakeSMPTServer.listen();
    }

    await Server.listen();

    logger.log(`Server listening at %s`, Server.url);

    await this.launch();
  }

  async close(force?: boolean): Promise<number> {
    this.closing = true;
    logger.warn(force ? "Forcefully shutting down..." : "Shutting down...");

    await this.watcher?.close();
    logger.debug("%p Watcher down", 2);

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

  private async launch(): Promise<void> {
    if (Server.url) {
      const targetBrowser = Config.get<Browser>("browser");

      if (targetBrowser) {
        logger.info(`Launching %S browser...`, targetBrowser);

        await open(Server.url, { app: { name: targetBrowser } });
      }
    }
  }
}
