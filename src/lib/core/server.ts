import express from "express";
import expressWs, { Application } from "express-ws";
import { ServerError, TrackedSocket } from "../../types";
import { logger } from "../services";
import { Config } from "./config";
import { Renderer } from "./renderer";
import * as ws from "ws";
import http from "http";
import { promisify } from "util";

export class Server {
  private static instance: Server;

  private readonly _app: Application;

  private readonly _ws: ws.Server;

  private httpServer?: http.Server;

  private connections = new Set<TrackedSocket>();

  serveURL?: string;

  closing = false;

  private constructor(renderer: Renderer) {
    const ws = expressWs(express(), undefined, {
      wsOptions: {
        clientTracking: true,
      },
    });

    this._app = ws.app;

    this._app.engine(Config.get("extname"), renderer.engine.bind(renderer));

    this._app.set("view engine", `.${Config.get("extname")}`);

    this._app.set("views", Config.relPath("views"));

    this._ws = ws.getWss();
  }

  static create(renderer: Renderer): Server {
    logger.info(`Configuring .${Config.get("extname")} renderer...`);
    this.instance = new Server(renderer);
    this.instance.serveURL = this.instance.resolveServerUrl();
    return this.instance;
  }

  static get(): Server {
    return this.instance;
  }

  static get app(): Application {
    return this.instance._app;
  }

  static get ws(): ws.Server {
    return this.instance._ws;
  }

  static get url(): string | undefined {
    return this.instance.serveURL;
  }

  static listen(port?: number): Promise<void> {
    return this.instance.listen(port);
  }

  listen(port?: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.serveURL = this.resolveServerUrl(port);

      this.mountPort(Config.get("port"), resolve);

      this.httpServer?.on("connection", this.trackConnections.bind(this));
      this.httpServer?.on("secureConnection", this.trackConnections.bind(this));
      this.httpServer?.on("request", this.trackIdleState.bind(this));
      this.httpServer?.on("error", (error: ServerError) => {
        if (error.code === "EADDRINUSE") {
          logger.warn("%s is already in use.", this.serveURL);
          logger.warn("Trying a random free port...");

          setTimeout(() => {
            this.mountPort(0, resolve);
          }, 500);
        } else {
          logger.error("Server error", error);
          reject();
        }
      });
    });
  }

  async close(force?: boolean) {
    const closeWs = promisify(this._ws.close.bind(this._ws));
    const closeHttp = promisify(
      (this.httpServer?.close as any).bind(this.httpServer)
    );

    await closeHttp();
    logger.debug("-- Server closed...");

    await closeWs();
    logger.debug("-- Websocket's closed...");

    this.clearConnections(force);
  }

  private mountPort(port: number, callback: () => void) {
    this.httpServer = this._app.listen(port, Config.get("host"), callback);
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

  private trackConnections(socket: TrackedSocket) {
    socket._idle = true;
    this.connections.add(socket);

    this.httpServer?.once("close", () => {
      this.connections.delete(socket);
    });
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

  private destroySocket(socket: TrackedSocket, force?: boolean): void {
    if (force || (socket._idle && this.closing)) {
      socket.destroy();
      this.connections.delete(socket);
    }
  }

  private resolveServerUrl(port?: number) {
    const { protocol, host, port: configPort } = Config.get();
    return protocol + "://" + host + ":" + (port || configPort);
  }
}
