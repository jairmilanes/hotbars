import { NextFunction, Request, Response } from "express";
import { RequestEnhanced } from "../../types";
import { Envs } from "../../services";
import { EnvManager, Server } from "../../core";
import { logger } from "../../../services";
import { AddressInfo } from "ws";

export const persist = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const enhancedRequest = req as RequestEnhanced;

  const manager = EnvManager.get();

  const envName = Object.keys(manager.envs)
    .find((envName: string) => {
      if (manager.envs[envName as keyof Envs]) {
        const env = manager.envs[envName as keyof Envs]

        if (env) {
          const address = req.socket.address() as AddressInfo
          const envUrl = new URL(env?.web_url)
          const incomingUrl = new URL(`${req.protocol}://${req.hostname}${address?.port ? `:${address.port}` : ''}`)

          if (envUrl.host === incomingUrl.host) {
            return true
          }
        }
      }
    });

  logger.debug(`%p%P Current environment is "%s"`, 1, 1, envName)

  enhancedRequest.original = {
    params: { ...req.params },
    query: { ...req.query },
    env: envName ? manager.envs[envName as keyof Envs] : undefined
  };

  next()
};

export function persistParams() {
  Server.app.use(persist)
}
