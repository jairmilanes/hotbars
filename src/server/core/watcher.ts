import chokidar from "chokidar";
import { logger } from "../../services";
import { basename, extname, slash } from "../utils";
import {
  AnymatchPattern,
  WatcherChangeType,
  WatcherEvent,
  WatcherListeners,
  BaseOptions,
} from "../types";
import { EventManager, ServerEvent } from "./event-manager";
import { ConfigManager } from "../services/config-manager";

export class Watcher {
  private watcher?: chokidar.FSWatcher;

  private listeners: WatcherListeners = {};

  private config: ConfigManager;

  private isDashboard = false;

  constructor(config: ConfigManager) {
    this.config = config;
  }

  start(): Promise<void> {
    return new Promise((resolve) => {
      const watchables = this.config.get<string[]>("watch");

      logger.info("%sStarting watcher...", this.pfx());

      watchables.forEach((path) => {
        logger.debug(`%p%P %s`, 1, 1, path);
      });

      this.watcher = chokidar
        .watch(watchables, this.resolveOptions())
        .on(WatcherEvent.Change, this.changeType(WatcherEvent.Change))
        .on(WatcherEvent.Add, this.changeType(WatcherEvent.Add))
        .on(WatcherEvent.AddDir, this.changeType(WatcherEvent.AddDir))
        .on(WatcherEvent.Unlink, this.changeType(WatcherEvent.Unlink))
        .on(WatcherEvent.UnlinkDir, this.changeType(WatcherEvent.UnlinkDir))
        .once(WatcherEvent.Ready, () => {
          logger.debug(`%p %sWatcher listening`, 2, this.pfx());
          resolve();
        })
        .on(WatcherEvent.Error, (err) => {
          logger.error(`%p %sWatcher error: %O`, 2, this.pfx(), err);
        });

      EventManager.i.on(ServerEvent.RELOAD, () => {});
    });
  }

  async close(): Promise<void> {
    this.listeners = {};
    return this.watcher?.close();
  }

  private resolveOptions(): chokidar.WatchOptions {
    const options: chokidar.WatchOptions = {
      persistent: true,
      ignoreInitial: true,
      ignored: [
        // Always ignore dotfiles (important e.g. because editor hidden temp files)
        (testPath: string) =>
          testPath !== "." && /(^[.#]|(?:__|~)$)/.test(basename(testPath)),
        ...this.config.get<string[]>("ignore"),
      ],
    };

    if (this.config.get<string>("ignorePattern")) {
      (options.ignored as AnymatchPattern[]).push(
        this.config.get<string>("ignorePattern")
      );
    }

    return options;
  }

  private changeType(eventType: WatcherEvent) {
    return (changePath: string) => {
      return this.handleChange(eventType, changePath);
    };
  }

  private handleChange(eventType: WatcherEvent, changePath: string): void {
    const posixPath = slash(changePath);
    const type = this.resolveChangeType(posixPath);

    const structural =
      [
        WatcherEvent.Add,
        WatcherEvent.AddDir,
        WatcherEvent.Unlink,
        WatcherEvent.UnlinkDir,
      ].indexOf(eventType) > -1;

    const data = {
      type,
      path: posixPath,
      structural,
    };

    logger.info(`%sFile changed, updating %o`, this.pfx(), data);

    if (type === WatcherChangeType.Scss) {
      EventManager.i.emit(ServerEvent.SASS_CHANGED, data);
      return;
    }

    if (type === WatcherChangeType.Routes) {
      EventManager.i.emit(ServerEvent.ROUTES_CHANGED, data);
      return;
    }

    if (type === WatcherChangeType.Controller) {
      EventManager.i.emit(ServerEvent.CONTROLLERS_CHANGED, data);
      return;
    }

    if (type === WatcherChangeType.Auth) {
      EventManager.i.emit(ServerEvent.AUTH_HANDLERS_CHANGED, data);
      return;
    }

    if (type === WatcherChangeType.UserRuntime) {
      EventManager.i.emit(ServerEvent.USER_RUNTIME_CHANGED, data);
      return;
    }

    if (type === WatcherChangeType.DashboardRuntime) {
      EventManager.i.emit(ServerEvent.DASHBOARD_RUNTIME_CHANGED, data);
      return;
    }

    if (type === WatcherChangeType.PreCompiled) {
      EventManager.i.emit(ServerEvent.PRE_COMPILED_CHANGED, data);
      return;
    }

    if (type === WatcherChangeType.Email) {
      EventManager.i.emit(ServerEvent.EMAIL_FILES_CHANGED, data);
      return;
    }

    if (structural && type === WatcherChangeType.Page) {
      EventManager.i.emit(ServerEvent.VIEWS_CHANGED);
    }

    if (type === WatcherChangeType.File) {
      EventManager.i.emit(ServerEvent.FILES_CHANGED);
    }

    EventManager.i.emit(ServerEvent.HOT_RELOAD, data);
  }

  private resolveChangeType(changePath: string): WatcherChangeType {
    const ext = extname(changePath);

    if (changePath.indexOf(this.config.get<string>("routesConfigName")) > -1) {
      return WatcherChangeType.Routes;
    }

    if (
      !this.config.get("dev") &&
      changePath.indexOf(this.config.relPath("auth.path")) > -1
    ) {
      return WatcherChangeType.Auth;
    }

    if (changePath.indexOf(this.config.relPath("controllers")) > -1) {
      return WatcherChangeType.Controller;
    }

    if (changePath.indexOf(this.config.relPath("precompile")) > -1) {
      return WatcherChangeType.PreCompiled;
    }

    if (
      changePath.indexOf(this.config.relPath("helpers")) > -1 ||
      changePath.indexOf(this.config.relPath("lib")) > -1
    ) {
      if (this.config.get("dev")) {
        return WatcherChangeType.DashboardRuntime;
      }

      return WatcherChangeType.UserRuntime;
    }

    if (
      [
        "mailer.data",
        "mailer.layouts",
        "mailer.partials",
        "mailer.templates",
      ].some((name) => changePath.indexOf(this.config.relPath(name)) > -1)
    ) {
      return WatcherChangeType.Email;
    }

    if (ext === ".css") {
      return WatcherChangeType.Css;
    }

    if (ext === ".scss") {
      return WatcherChangeType.Scss;
    }

    if (changePath.indexOf(this.config.relPath("views")) > -1) {
      return WatcherChangeType.Page;
    }

    return WatcherChangeType.File;
  }

  private pfx() {
    return this.config.get("dev") ? "Dansboard:" : "";
  }
}
