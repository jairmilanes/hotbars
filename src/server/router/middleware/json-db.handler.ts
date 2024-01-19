import { set } from "lodash";
import { Config, Server } from "../../core";
import { createJsonRouter } from "../../services";
import { Request, Response } from "express";
import { DataManager } from "../../data";

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

  res.json({ message: `Collection "${req.body.name}" created!`});
};

const deleteCollection = async (req: Request, res: Response) => {
  if (!req.params.name) {
    return res.status(400).json({ message: "Missing colection name." });
  }

  await DataManager.get(JSON_DB).deleteCollection(req.params.name);

  res.json({ message: `Collection "${req.params.name}" deleted!`});
};

export const jsonDbHandler = () => {
  if (Config.enabled("jsonServer") && Config.get(JSON_DB)) {
    const jsonRouter = createJsonRouter();

    set(jsonRouter, "_source", "jsonDb");

    jsonRouter.get("/collections", collections);
    jsonRouter.post("/collections", createCollection);
    jsonRouter.delete("/collections/:name", deleteCollection);

    Server.app.use("/_api", jsonRouter);
  }
};
