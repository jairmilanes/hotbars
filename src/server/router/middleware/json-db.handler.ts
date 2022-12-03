import { Config, Server } from "../../core";
import { createJsonRouter } from "../../services";
import { logger } from "../../../services";
import { persistParams } from "../persist-params";
import { Request, Response } from "express";
import { DataManager } from "../../data";

const JSON_DB = "jsonDb";

const collections = async (req: Request, res: Response) => {
  const collections = await DataManager.get(JSON_DB).collections();

  res.jsonp(collections);
};

export const jsonDbHandler = () => {
  if (Config.enabled("jsonServer") && Config.get(JSON_DB)) {
    const jsonRouter = createJsonRouter();

    Server.app.get("/_api/collections", persistParams, collections);

    Server.app.use("/_api", persistParams, jsonRouter);

    logger.debug("%p%P Json DB handlers", 3, 0);
  }
};
