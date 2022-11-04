import chokidar from "chokidar";
import { spawnSync } from "node:child_process";
import expressWs from "express-ws";
import { basename, extname, joinPath, slash } from "../utils/path";
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
      .on(WatcherEventType.Change, (path: string) =>
        this.handleChange(WatcherEventType.Change, path)
      )
      .on(WatcherEventType.Add, (path: string) =>
        this.handleChange(WatcherEventType.Add, path)
      )
      .on(WatcherEventType.AddDir, (path: string) =>
        this.handleChange(WatcherEventType.AddDir, path)
      )
      .on(WatcherEventType.Unlink, (path: string) =>
        this.handleChange(WatcherEventType.Unlink, path)
      )
      .on(WatcherEventType.UnlinkDir, (path: string) =>
        this.handleChange(WatcherEventType.UnlinkDir, path)
      )
      .on(WatcherEventType.Ready, () => {
        this.recompileSass();
        logger.debug(`Watching for changes on ${this.config.watch}`);
        callback();
      })
      .on(WatcherEventType.Error, function (err) {
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

  dispatch(eventType: WatcherEventType, change: WatcherChange): void {
    if (Array.isArray(this.listeners[eventType])) {
      this.listeners[eventType].forEach((callback) => {
        callback(eventType, change);
      });
    }

    if (Array.isArray(this.listeners[WatcherEventType.All])) {
      this.listeners[WatcherEventType.All].forEach((callback) => {
        callback(eventType, change);
      });
    }
  }

  async close(): Promise<void> {
    this.listeners = {};
    return this.watcher?.close();
  }

  private handleChange(eventType: WatcherEventType, changePath: string): void {
    const posixPath = slash(changePath);
    const type = this.resolveChangeType(posixPath);

    logger.debug(`-- Change type is "${type}"`);

    this.dispatch(eventType, { type, path: posixPath });

    // No need to broadcast route configuration changes
    if (type === WatcherChangeType.Routes) {
      return;
    }

    // Recompile scss before broadcasting to clients
    if (type === WatcherChangeType.Scss) {
      this.recompileSass();
    }

    const { clients } = this.instance.getWss();

    logger.debug(`-- Broadcasting to ${clients.size} clients...`);

    clients.forEach((ws) => {
      if (ws) {
        ws.send(JSON.stringify({ type, file: posixPath }), (error) => {
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
    logger.debug(`paths:`, `${sourcePath}:${destPath}`);

    try {
      const result = spawnSync("sass", [path, "--style", "expanded"], {
        cwd: this.config.root,
        shell: true,
      });

      if (result.error) {
        const stderr = result?.stderr.toString().trim();
        if (stderr.length) {
          logger.debug("error:", result?.stderr.toString());
        }
      } else {
        const stdout = result?.stdout.toString().trim();

        if (stdout.length) {
          logger.debug("out:", result?.stdout.toString());
        }
      }

      const output = result?.output.toString().trim();

      if (output.length) {
        output.split(/\r?\n|\r|\n/g).forEach((line) => {
          logger.debug("output:", line.replace(",,", ""));
        });
      }
    } catch (e) {
      logger.error("error:", e);
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

    if (changePath.indexOf(joinPath("/", this.config.views)) > -1) {
      return WatcherChangeType.Page;
    }

    return WatcherChangeType.File;
  }
}
