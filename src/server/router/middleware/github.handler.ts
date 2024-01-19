import {set} from "lodash"
import express, {Request, Response} from "express"
import { Versioning, Server } from "../../core";

async function status(req: Request, res: Response) {
  const response = await Versioning.status();
  return res.json(response)
}

async function meta(req: Request, res: Response) {
  const status = await Versioning.status();
  const changes = await Versioning.changes();

  return res.json({
    branch: Versioning.get().branch,
    status,
    messages: Versioning.get().messages,
    changes
  })
}

function changes(req: Request, res: Response) {
  /* const response = await api().changes();
  return res.json(response) */
}

async function push(req: Request, res: Response) {
  const response = await Versioning.get().push(`Hotbars:Push:${Date.now()}`)
  /* await api().push(req.body?.message || "Hotbars: Push"); */

  return res.json(response)
}

function pull(req: Request, res: Response) {

}

export function githugHandler() {
  const githugRouter = express.Router()

  set(githugRouter, "_source", "git")

  githugRouter.get("/status", status)
  githugRouter.post("/push", push)
  githugRouter.get("/meta", meta)

  Server.app.use("/git", githugRouter)
}