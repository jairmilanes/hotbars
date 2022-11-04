import http from "http";
import express, { Express } from "express";
import expressWs from "express-ws";
import open from "open";
import { AddressInfo } from "net";
import { promisify } from "util";
import { Server } from "./server";
import { Config } from "./config";
import { logger } from "./logger";
import { Watcher } from "./watcher";
import {
  ServerError,
  TrackedSocket,
  WatcherChange,
  WatcherChangeType,
  WatcherEventType,
} from "../types";
import { bootstrap } from "./bootstrap";

export class App {
  private readonly config: Config;

  express: Express;

  instance: expressWs.Instance;

  watcher: Watcher;

  server: Server;

  app?: http.Server;

  serveURL?: string;

  connections = new Set<TrackedSocket>();

  closing = false;

  constructor(config: Config) {
    this.config = config;

    this.express = express();

    this.instance = expressWs(this.express, undefined, {
      wsOptions: {
        clientTracking: true,
      },
    });

    this.watcher = new Watcher(this.config, this.instance);

    this.server = new Server(this.config, this.instance);
  }

  async start(): Promise<void> {
    logger.debug(`Creating express websocket server...`);

    const bootstrapData = await bootstrap(this.config);

    this.server.configure(this.instance, bootstrapData);

    this.watcher.on(WatcherEventType.All, (eventType, change) => {
      if (
        change.type === WatcherChangeType.Routes ||
        eventType !== WatcherEventType.Change
      ) {
        this.server.router.configure();
      }

      if (change.type === WatcherChangeType.File) {
        this.server.renderer.configure(bootstrapData);
      }
    });

    this.listen();
  }

  private listen(port?: number): void {
    this.serveURL =
      this.config.protocol +
      "://" +
      this.config.host +
      ":" +
      (port || this.config.port);

    this.app = this.instance.app.listen(
      port || this.config.port,
      this.config.host,
      () => {
        logger.info(`🔥 Hot reload server listening at ${this.serveURL}`);

        this.watcher.watch(() => {
          this.launch();
        });
      }
    );

    this.app?.on("connection", this.trackConnections.bind(this));
    this.app?.on("secureConnection", this.trackConnections.bind(this));
    this.app?.on("request", this.trackIdleState.bind(this));
    this.app?.on("error", this.error.bind(this));
  }

  private trackIdleState(
    req: http.IncomingMessage,
    res: http.OutgoingMessage
  ): void {
    const socket = req.socket as TrackedSocket;
    socket._idle = false;

    res.on("finish", () => {
      socket._idle = false;
      this.destroySocket(socket);
    });
  }

  private trackConnections(socket: TrackedSocket) {
    socket._idle = true;
    this.connections.add(socket);

    this.app?.once("close", () => {
      this.connections.delete(socket);
    });
  }

  private async launch(): Promise<void> {
    if (this.serveURL) {
      logger.info(`Launching ${this.config.browser}...`);
      await open(this.serveURL, { app: { name: this.config.browser } });
    }
  }

  private async error(error: ServerError): Promise<void> {
    if (error.code === "EADDRINUSE") {
      logger.warn("%s is already in use.", this.serveURL);
      logger.warn("Trying a random free port...");

      setTimeout(() => {
        this.app = this.instance.app.listen(0, this.config.host, async () => {
          this.listen((this.app?.address() as AddressInfo).port);
        });
      }, 500);
    } else {
      logger.error("Server error", error);
      await this.close();
    }
  }

  async close(force?: boolean): Promise<number> {
    console.info("CLOSING");
    this.closing = true;
    logger.info(force ? "Forcefully shutting down..." : "Shutting down...");

    await this.watcher.close();
    logger.debug("-- Watcher down");

    try {
      const ws = this.instance.getWss();
      const closeWs = promisify(ws.close.bind(ws));
      const closeHttp = promisify((this.app?.close as any).bind(this.app));

      await closeHttp();
      logger.debug("-- Server closed...");

      await closeWs();
      logger.debug("-- Websocket's closed...");

      this.clearConnections(force);

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

  private clearConnections(force?: boolean): void {
    if (this.connections.size > 0) {
      logger.debug(`-- Closing ${this.connections.size} connections...`);

      for (const socket of this.connections) {
        this.destroySocket(socket, force);
      }

      logger.debug(`-- Connections down...`);
    }
  }

  private destroySocket(socket: TrackedSocket, force?: boolean): void {
    if (force || (socket._idle && this.closing)) {
      socket.destroy();
      this.connections.delete(socket);
    }
  }
}
