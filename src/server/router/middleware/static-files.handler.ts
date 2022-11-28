import express from "express";
import { logger } from "../../../services";
import { Config, Server } from "../../core";
import { joinPath } from "../../utils";

export const staticFilesHandler = () => {
  const { serverPublic, source, public: publicDir } = Config.get();

  const cacheConfig = { cacheControl: true, maxAge: "3h" };

  const usersPublic = joinPath(source, publicDir);
  Server.app.use("/public", express.static(usersPublic));
  Server.app.use("/public", express.static(serverPublic, cacheConfig));

  logger.debug("%p%P Static file server at %s", 3, 0);
  logger.debug("%p%P [GET]%s", 5, 0, usersPublic);
};
