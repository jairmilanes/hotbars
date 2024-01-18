import { NextFunction, Request, Response } from "express";
import { RequestEnhanced } from "../types";
import { EnvManager } from "../core";
import { Envs } from "../services";

export const persistParams = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const manager = EnvManager.get();

  (req as RequestEnhanced).original = {
    params: { ...req.params },
    query: { ...req.query },
    envName: Object.keys(manager.envs)
      .find((envName: string) => {
        if (manager.envs[envName as keyof Envs]) {
          const env = manager.envs[envName as keyof Envs]

          if (new URL(env?.web_url).origin === req.headers["origin"]) {
            return env
          }
        }
      })
  };

  next();
};
