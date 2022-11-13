import chokidar from "chokidar";
import { basename, extname, slash } from "../utils";
import {
  AnymatchPattern,
  WatcherChange,
  WatcherChangeType,
  WatcherEvent,
  WatcherEventCallback,
  WatcherListeners,
} from "../../types";
import { logger } from "../services";
import { Config } from "./config";

export class Watcher {
  private watcher?: chokidar.FSWatcher;

  private listeners: WatcherListeners = {};

  watch(callback: () => void): void {
    const watchables = Config.value<string[]>("watch");

    logger.info("Creating watcher...");

    watchables.forEach((path) => {
      logger.debug(`-- ${path}`);
    });

    this.watcher = chokidar
      .watch(watchables, this.resolveOptions())
      .on(WatcherEvent.Change, this.changeType(WatcherEvent.Change))
      .on(WatcherEvent.Add, this.changeType(WatcherEvent.Add))
      .on(WatcherEvent.AddDir, this.changeType(WatcherEvent.AddDir))
      .on(WatcherEvent.Unlink, this.changeType(WatcherEvent.Unlink))
      .on(WatcherEvent.UnlinkDir, this.changeType(WatcherEvent.UnlinkDir))
      .once(WatcherEvent.Ready, () => {
        logger.debug(`Watching listening.`);
        callback();
      })
      .on(WatcherEvent.Error, function (err) {
        logger.error(`Watcher error:`, err);
      });
  }

  on(eventName: string, callback: WatcherEventCallback): void {
    if (!Array.isArray(this.listeners[eventName])) {
      this.listeners[eventName] = [];
    }

    this.listeners[eventName].push(callback);
  }

  off(eventType: string, callback: () => void): void {
    if (Array.isArray(this.listeners[eventType])) {
      this.listeners[eventType] = this.listeners[eventType].filter(
        (cb) => cb !== callback
      );
    }
  }

  dispatch(eventType: WatcherEvent, change: WatcherChange): void {
    if (Array.isArray(this.listeners[eventType])) {
      this.listeners[eventType].forEach((callback) => {
        callback(eventType, change);
      });
    }

    if (Array.isArray(this.listeners[WatcherEvent.All])) {
      this.listeners[WatcherEvent.All].forEach((callback) => {
        callback(eventType, change);
      });
    }
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

    logger.debug(`-- Change type is "${type}"`);

    const structural =
      [
        WatcherEvent.Add,
        WatcherEvent.AddDir,
        WatcherEvent.Unlink,
        WatcherEvent.UnlinkDir,
      ].indexOf(eventType) > -1;

    this.dispatch(eventType, { type, path: posixPath, structural });

    // No need to broadcast route configuration changes
    if (type === WatcherChangeType.Routes) {
      return;
    }

    // No need to broadcast route configuration changes
    if (type === WatcherChangeType.Controller) {
      return;
    }

    this.dispatch(WatcherEvent.Broadcast, {
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

    if (changePath.indexOf(Config.relPath("controllers")) > -1) {
      return WatcherChangeType.Controller;
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
