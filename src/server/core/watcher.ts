import chokidar from "chokidar";
import { logger } from "../../services";
import { basename, extname, slash } from "../utils";
import {
  AnymatchPattern,
  WatcherChangeType,
  WatcherEvent,
  WatcherListeners,
} from "../types";
import { Config } from "./config";
import { EventManager, ServerEvent } from "./event-manager";

export class Watcher {
  private watcher?: chokidar.FSWatcher;

  private listeners: WatcherListeners = {};

  start(): Promise<void> {
    return new Promise((resolve) => {
      const watchables = Config.value<string[]>("watch");

      logger.info("Starting watcher...");

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
          logger.debug(`%p Watcher listening`, 2);
          resolve();
        })
        .on(WatcherEvent.Error, function (err) {
          logger.error(`%p Watcher error: %O`, 2, err);
        });
    });
  }

  async close(): Promise<void> {
    this.listeners = {};
    return this.watcher?.close();
  }

  private resolveOptions(): chokidar.WatchOptions {
    const { ignore, ignorePattern } = Config.get();

    const options: chokidar.WatchOptions = {
      persistent: true,
      ignoreInitial: true,
      ignored: [
        // Always ignore dotfiles (important e.g. because editor hidden temp files)
        (testPath: string) =>
          testPath !== "." && /(^[.#]|(?:__|~)$)/.test(basename(testPath)),
        ...ignore,
      ],
    };

    if (ignorePattern) {
      (options.ignored as AnymatchPattern[]).push(ignorePattern);
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

    logger.info(`Change type %s, updating...`, type);

    const structural =
      [
        WatcherEvent.Add,
        WatcherEvent.AddDir,
        WatcherEvent.Unlink,
        WatcherEvent.UnlinkDir,
      ].indexOf(eventType) > -1;

    if (type === WatcherChangeType.Scss) {
      EventManager.i.emit(ServerEvent.SASS_CHANGED);
      return;
    }

    if (type === WatcherChangeType.Routes) {
      EventManager.i.emit(ServerEvent.ROUTES_CHANGED);
      return;
    }

    if (type === WatcherChangeType.Email) {
      EventManager.i.emit(ServerEvent.EMAIL_FILES_CHANGED);
      return;
    }

    if (type === WatcherChangeType.Controller) {
      EventManager.i.emit(ServerEvent.CONTROLLERS_CHANGED);
    }

    if (type === WatcherChangeType.Auth) {
      EventManager.i.emit(ServerEvent.AUTH_HANDLERS_CHANGED);
    }

    if (type === WatcherChangeType.PreCompiled) {
      EventManager.i.emit(ServerEvent.PRE_COMPILED_CHANGED);
    }

    if (structural && type === WatcherChangeType.Page) {
      EventManager.i.emit(ServerEvent.VIEWS_CHANGED);
    }

    if (type === WatcherChangeType.File) {
      EventManager.i.emit(ServerEvent.FILES_CHANGED);
    }

    EventManager.i.emit(ServerEvent.HOT_RELOAD, ServerEvent.HOT_RELOAD, {
      type,
      path: posixPath,
      structural,
    });
  }

  private resolveChangeType(changePath: string): WatcherChangeType {
    const ext = extname(changePath);

    if (changePath.indexOf(Config.get<string>("routesConfigName")) > -1) {
      return WatcherChangeType.Routes;
    }

    if (changePath.indexOf(Config.relPath("auth.path")) > -1) {
      return WatcherChangeType.Auth;
    }

    if (changePath.indexOf(Config.relPath("controllers")) > -1) {
      return WatcherChangeType.Controller;
    }

    if (changePath.indexOf(Config.relPath("precompile")) > -1) {
      return WatcherChangeType.PreCompiled;
    }

    if (
      [
        "mailer.data",
        "mailer.layouts",
        "mailer.partials",
        "mailer.templates",
      ].some((name) => changePath.indexOf(Config.relPath(name)) > -1)
    ) {
      return WatcherChangeType.Email;
    }

    if (ext === ".css") {
      return WatcherChangeType.Css;
    }

    if (ext === ".scss") {
      return WatcherChangeType.Scss;
    }

    if (changePath.indexOf(Config.relPath("views")) > -1) {
      return WatcherChangeType.Page;
    }

    return WatcherChangeType.File;
  }
}
