import express from "express";
import expressWs, { Application as WsApplication } from "express-ws";
import * as ws from "ws";
import http from "http";
import { promisify } from "util";
import { logger } from "../../services";
import { RouteMap, ServerError, TrackedSocket } from "../types";
import { Config, Renderer } from "../core";
import { mapRoutes } from "../utils";

export class Server {
  private static instance: Server;

  private readonly _app: WsApplication;

  private readonly _ws: ws.Server;

  private httpServer?: http.Server;

  private connections = new Set<TrackedSocket>();

  serveURL?: string;

  closing = false;

  routes: RouteMap[] = [];

  private constructor() {
    const ws = expressWs(express(), undefined, {
      wsOptions: {
        clientTracking: true,
      },
    });

    this._app = ws.app;

    const renreder = Renderer.get();

    this._app.engine(Config.get("extname"), renreder.engine.bind(renreder));

    this._app.set("view engine", `.${Config.get("extname")}`);

    this._app.set("views", [
      Config.relPath("views"),
      Config.get("serverDefaultViews"),
    ]);

    this._ws = ws.getWss();
  }

  static create(): Server {
    logger.info(`%p%P HTTP server...`, 1, 1);
    this.instance = new Server();
    this.instance.serveURL = this.instance.resolveServerUrl();
    return this.instance;
  }

  static get(): Server {
    return this.instance;
  }

  static get app(): WsApplication {
    return this.instance._app;
  }

  static get routes(): RouteMap[] {
    return this.instance.routes;
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

  static mapRoutes() {
    this.instance.routes = mapRoutes(Server.app._router.stack);
  }

  listen(port?: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.serveURL = this.resolveServerUrl(port);

      this.mountPort(port || Config.get("port"), resolve);

      this.httpServer?.on("connection", this.trackConnections.bind(this));
      this.httpServer?.on("secureConnection", this.trackConnections.bind(this));
      this.httpServer?.on("request", this.trackIdleState.bind(this));
      this.httpServer?.on("error", (error: ServerError) => {
        if (error.code === "EADDRINUSE") {
          logger.warn("%p %s is already in use.", 2, this.serveURL);
          logger.warn("%p Trying a random free port...", 2);

          this.mountPort(0, resolve);
        } else {
          logger.error("%p Server error %O", 2, error);
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
    logger.debug("%P Server closed.", 2);

    await closeWs();
    logger.debug("%P Websocket's closed.", 2);

    this.clearConnections(force);
  }

  private mountPort(port: number, callback: () => void) {
    this.httpServer = this._app.listen(port, Config.get("host"), callback);
  }

  private clearConnections(force?: boolean): void {
    if (this.connections.size > 0) {
      logger.debug(`%P Closing %s connections...`, 2, this.connections.size);

      for (const socket of this.connections) {
        this.destroySocket(socket, force);
      }

      logger.debug(`%P All connections closed.`, 2);
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
