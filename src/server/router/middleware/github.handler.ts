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
    branchSummary: Versioning.get().git,
    status,
    messages: Versioning.get().messages,
    changes
  })
}

async function push(req: Request, res: Response) {
  const response = await Versioning.get().push(`Hotbars:Push:${Date.now()}`)
  /* await api().push(req.body?.message || "Hotbars: Push"); */

  return res.json(response)
}

export function githugHandler() {
  const githugRouter = express.Router()

  set(githugRouter, "_source", "git")

  githugRouter.get("/status", status)
  githugRouter.post("/push", push)
  githugRouter.get("/meta", meta)

  Server.app.use("/git", githugRouter)
}