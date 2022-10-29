import chokidar from "chokidar";
import { spawnSync } from "node:child_process";
import expressWs from "express-ws";
import { basename, extname, joinPath } from "../utils/path";
import {
  AnymatchPattern,
  WatcherChange,
  WatcherChangeType,
  WatcherEventCallback,
  WatcherEventType,
  WatcherListeners,
} from "../types";
import { Config } from "./config";
import { logger } from "./logger";

export class Watcher {
  private readonly config: Config;

  private readonly instance: expressWs.Instance;

  private watcher?: chokidar.FSWatcher;

  private listeners: WatcherListeners = {};

  constructor(config: Config, instance: expressWs.Instance) {
    this.config = config;
    this.instance = instance;
  }

  watch(callback: () => void): void {
    logger.debug("Creating file changes watcher...");

    const options: chokidar.WatchOptions = {
      persistent: true,
      ignoreInitial: true,
      ignored: [
        // Always ignore dotfiles (important e.g. because editor hidden temp files)
        function (testPath: string) {
          return (
            testPath !== "." && /(^[.#]|(?:__|~)$)/.test(basename(testPath))
          );
        },
      ],
    };

    if (this.config.ignore) {
      options.ignored = (options.ignored as AnymatchPattern[]).concat(
        this.config.ignore
      );
    }

    if (this.config.ignorePattern) {
      (options.ignored as AnymatchPattern[]).push(this.config.ignorePattern);
    }

    this.watcher = chokidar.watch(this.config.watch, options);

    this.watcher
      .on("change", this.handleChange.bind(this))
      .on("add", this.handleChange.bind(this))
      .on("unlink", this.handleChange.bind(this))
      .on("addDir", this.handleChange.bind(this))
      .on("unlinkDir", this.handleChange.bind(this))
      .on("ready", () => {
        logger.debug(`Watching for changes on ${this.config.watch}`);
        callback();
      })
      .on("error", function (err) {
        logger.error(`Watcher error:`, err);
      });
  }

  on(eventName: string, callback: WatcherEventCallback): void {
    if (!Array.isArray(this.listeners[eventName])) {
      this.listeners[eventName] = [];
    }

    this.listeners[eventName].push(callback);
  }

  off(eventName: string, callback: () => void): void {
    if (Array.isArray(this.listeners[eventName])) {
      this.listeners[eventName] = this.listeners[eventName].filter(
        (cb) => cb !== callback
      );
    }
  }

  dispatch(eventName: WatcherEventType, change: WatcherChange): void {
    if (Array.isArray(this.listeners[eventName])) {
      this.listeners[eventName].forEach((callback) => {
        callback(change);
      });
    }
  }

  async close(): Promise<void> {
    return this.watcher?.close();
  }

  private handleChange(changePath: string): void {
    const type = this.resolveChangeType(changePath);

    logger.debug(`-- Change type is "${type}"`);

    this.dispatch(WatcherEventType.Changed, { type, path: changePath });

    // No need to broadcast route configuration changes
    if (type === WatcherChangeType.Routes) {
      return;
    }

    // Recompile scss before broadcasting to clients
    if (type === WatcherChangeType.Scss) {
      return this.recompileSass();
    }

    const { clients } = this.instance.getWss();

    logger.debug(`-- Broadcasting to ${clients.size} clients...`);

    clients.forEach((ws) => {
      if (ws) {
        ws.send(type, (error) => {
          if (error) {
            logger.error("Websocket error:", error);
          }
        });
      }
    });

    logger.debug("All WS clients have been updated.");
  }

  private recompileSass() {
    const sourcePath = joinPath(this.config.source, this.config.styles);
    const destPath = joinPath(
      this.config.source,
      this.config.public,
      this.config.styles
    );
    const path = `${sourcePath}:${destPath}`;

    logger.info(`Recompiling sass files...`);
    logger.debug(`-- paths: ${sourcePath}:${destPath}`);

    try {
      const result = spawnSync("sass", [path, "--style", "expanded"], {
        cwd: this.config.root,
        shell: true,
      });

      if (result.error) {
        logger.debug("-- stderr:", result?.stderr.toString());
      } else {
        logger.debug("-- stdout:", result?.stdout.toString());
      }
    } catch (e) {
      logger.error("-- sass error", e);
    }
  }

  private resolveChangeType(changePath: string): WatcherChangeType {
    const ext = extname(changePath);

    if (changePath.indexOf(this.config.routesConfigName) > -1) {
      return WatcherChangeType.Routes;
    }

    if (ext === ".css") {
      return WatcherChangeType.css;
    }

    if (ext === ".scss") {
      return WatcherChangeType.Scss;
    }

    return WatcherChangeType.File;
  }
}
