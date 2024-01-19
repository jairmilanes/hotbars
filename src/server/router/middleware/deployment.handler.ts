import express, { Request, Response } from "express";
import { logger } from "../../../services";
import { Config, EnvManager, Server } from "../../core";

const enabled = (res: Response) => {
  if (!Config.enabled("deployment")) {
    return res
      .status(400)
      .json({message: "Deployment feature is disabled."})
  }
  return true;
}

const createEnv = async (req: Request, res: Response) => {
  if (enabled(res)) {
    try {
      logger.debug("%p%P Env Handler %s %o", 3, 1, req)
      res.json((await EnvManager.get().create(req.body.name)))
    } catch(e) {
      const err= e as Error
      logger.error(e)
      res.status(400)
        .json({ message: err.message })
    }
  }
}

const getStatus = async (req: Request, res: Response) => {
  if (enabled(res)) {
    try {
      const status = EnvManager.get().status()
      res.json(status)
    } catch (e) {
      const err = e as Error
      logger.error(e)
      res.status(400)
        .json({ message: err.message })
    }
  }
}

const deployCode = (req: Request, res: Response) => {

}

const reloadEnvs = async (req: Request, res: Response) => {
  if (enabled(res)) {
    try {
      const apps = await EnvManager.get().load()
      res.json(apps)
    } catch (e) {
      const err = e as Error
      logger.error(e)
      res.status(400)
        .json({ message: err.message })
    }
  }
}

const syncEnv = async (req: Request, res: Response) => {
  if (enabled(res)) {
    try {
      const app = await EnvManager.get().sync(req.params.envId as any)
      res.json(app)
    } catch (e) {
      const err = e as Error
      logger.error(e)
      res.status(400)
        .json({ message: err.message })
    }
  }
}

const notifyEnv = async (req: Request, res: Response) => {
  if (enabled(res)) {
    try {
      const app = await EnvManager.get().notify(
        req.body.resource, req.body.action, req.body.data
      )
      res.json(app)
    } catch (e) {
      const err = e as Error
      logger.error(e)
      res.status(400)
        .json({ message: err.message })
    }
  }
}

export const deploymentHandler = () => {
  const router = express.Router()

  router.get("/status", getStatus)
  router.get("/deploy", deployCode)
  router.post("/env/:envId/sync", syncEnv)
  router.post("/env/:envId/notify", notifyEnv)
  router.post("/env/:envId/push", notifyEnv)
  router.get("/env", reloadEnvs)
  router.post("/env", createEnv)

  Server.app.use("/_d", router)
}
