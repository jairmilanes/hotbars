import { merge } from "lodash"
import { Config, EventManager, Server, ServerEvent } from "../../core";
import { createJsonRouter } from "../../services";
import express, { NextFunction, Request, Response } from "express";
import { DataManager } from "../../data";
import { RequestEnhanced, User } from "../../types";
import { replaceRouter } from "../replace";
import { split } from "../../../utils";

const JSON_DB = "jsonDb";

const collections = async (req: Request, res: Response) => {
  const db = DataManager.get(JSON_DB);
  const collections = await db.collections();
  const results = [];

  for (let i = 0; i < collections.length; i++) {
    const result = await db.from(collections[i]).limit(2)

    results.push({
      id: collections[i],
      name: collections[i],
      single: !Array.isArray(result)}
    )
  }

  res.jsonp(results);
};

const createCollection = async (req: Request, res: Response) => {
  if (!req.body.name) {
    return res.status(400).json({ message: "Missing colection name." });
  }

  await DataManager.get(JSON_DB).createCollection(req.body.name, req.body.single === "true");

  EventManager.i.emit(ServerEvent.ROUTES_CHANGED, {});

  res.json({ message: `Collection "${req.body.name}" created!`});
};

const deleteCollection = async (req: Request, res: Response) => {
  if (!req.params.name) {
    return res.status(400).json({ message: "Missing colection name." });
  }

  await DataManager.get(JSON_DB).deleteCollection(req.params.name);

  EventManager.i.emit(ServerEvent.ROUTES_CHANGED, {});

  res.json({ message: `Collection "${req.params.name}" deleted!`});
};

const metaMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  if (["PATCH", "POST", "PUT"].indexOf(req.method.toUpperCase()) > -1) {
    const meta: any = {
      status: "draft",
      visibility: "public",
    }

    if (req.method.toUpperCase() === "POST") {
      meta.createdAt = Date.now();
      meta.updatedAt = Date.now();
      meta.userId = (req.user as User | undefined)?.id;
    }

    if (req.method.toUpperCase() === "PATCH" || req.method.toUpperCase() === "PUT") {
      const [collection, identifyer] = split(req.path, "/");
      meta.updatedAt = Date.now();

      if (!req.body?.meta?.userId) {
        meta.userId = (req.user as User | undefined)?.id;
      }

      const entry = await DataManager.get()
        .from(collection)
        .get(identifyer)

      res.locals.previousData = merge({}, entry)
    }

    req.body = merge({ meta }, req.body)
  }

  next()
}

const createRouter = () => {
  const jsonRouter = createJsonRouter();
  const customRouter = express.Router()

  customRouter.get("/collections", collections);
  customRouter.post("/collections", createCollection);
  customRouter.delete("/collections/:name", deleteCollection);

  return [customRouter, metaMiddleware, jsonRouter]
}

const reloadJsonServer = () => {
  replaceRouter("jsonDb", createJsonRouter());
}

export const jsonDbHandler = () => {
  EventManager.i.on(ServerEvent.ROUTES_CHANGED, reloadJsonServer)

  if (Config.enabled("jsonServer") && Config.get(JSON_DB)) {
    Server.app.use("/_api", ...createRouter());
  }
};
