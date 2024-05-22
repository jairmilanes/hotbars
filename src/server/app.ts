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
  PreRenderer,
  DashboardConfig,
  EnvManager,
  Versioning,
  Cache
} from "./core";
import { Router } from "./router";
import { AuthManager } from "./auth";
import { DataManager } from "./data";
import { Controllers } from "./controllers";
import { FakeSMPTServer } from "./smtp";

import "./hooks"

export class App {
  static instance: App;
  private watcher?: Watcher;
  private dashboardWatcher?: Watcher;
  private router?: Router;

  closing = false;

  constructor() {
    logger.log(`Initializing ${Config.get("env")} server:`);

    if (Config.enabled("language")) {
      logger.debug("Default language (%s)", Config.get("currentLanguage"));
    }
  }

  static async create() {
    this.instance = new App()

    await Cache.create();
    EventManager.create();
    Controllers.create();
    Renderer.create();
    PreRenderer.create();
    Mailer.create();
    AuthManager.create();
    FakeSMPTServer.create();
    BrowserifyCompiler.create();
    SassCompiler.create();
    Versioning.create();
    EnvManager.create(Config.get("deployment.service"));

    if (Config.is("env", Env.Local)) {
      this.instance.watcher = new Watcher(Config.get());

      if (DashboardConfig.get("dev")) {
        this.instance.dashboardWatcher = new Watcher(DashboardConfig.get());
      }
    }

    Server.create();

    this.instance.router = new Router();

    return this.instance
  }

  async start(): Promise<void> {
    logger.info(`Botstraping...`);

    await BootstrapData.run();
    await Controllers.load();
    await AuthManager.load();
    await Versioning.load();
    await EnvManager.load();

    if (Config.get("jsonDb")) {
      await DataManager.create("jsonDb");
    }

    SassCompiler.compile();

    logger.info(`Runtime`);

    if (DashboardConfig.get("dev")) {
      // compile dashboard runtime
      await BrowserifyCompiler.compileDashboardRuntime();
    }

    await BrowserifyCompiler.compileUserRuntime();

    // EventManager.i.emit(ServerEvent.INIT);

    this.router?.configure();

    if (Config.is("env", Env.Local)) {
      logger.silly("Watching files");

      await this.watcher?.start();

      if (DashboardConfig.get("dev")) {
        await this.dashboardWatcher?.start();
      }

      logger.debug(`Watcher listening`);

      // SMTP Server only works in dev
      if (Config.enabled("smtpServer")) {
        FakeSMPTServer.listen();
      }
    }

    await Server.listen();

    logger.log(`Server listening at %s`, Server.url);

    if (Config.is("env", Env.Local)) {
      await this.launch();
    }
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
