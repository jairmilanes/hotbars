import express from "express";
import { logger } from "../../../services";
import { Config, Server } from "../../core";
import { joinPath } from "../../utils";

export const staticFilesHandler = () => {
  const {
    serverScripts,
    serverStyles,
    source,
    public: publicDir,
  } = Config.get();

  const cacheConfig = { cacheControl: true, maxAge: "3h" };

  Server.app.use("/hhr-scripts", express.static(serverScripts, cacheConfig));
  Server.app.use("/hhr-styles", express.static(serverStyles, cacheConfig));

  const absolute = joinPath(source, publicDir);

  Server.app.use("", express.static(absolute));

  logger.debug("%p%P Static file server at %s", 3, 0);
  logger.debug("%p%P [GET]%s", 5, 0, absolute);
};
