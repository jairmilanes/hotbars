import express from "express";
import favicon from "serve-favicon";
import { logger } from "../../../services";
import { Config, DashboardConfig, Server } from "../../core";
import { joinPath } from "../../utils";
import { BrowserifyCompiler } from "../../services";
import { existsSync } from "fs";

export const staticFilesHandler = () => {
  const { source, public: publicDir } = Config.get();
  const cacheConfig = { cacheControl: true, maxAge: "3h" };
  const usersPublic = joinPath(source, publicDir);
  const dashboardPublic = DashboardConfig.fullPath("public");

  // Favicon server
  if (existsSync(joinPath(usersPublic, "images", "favicon.ico"))) {
    Server.app.use(favicon(joinPath(usersPublic, "images", "favicon.ico")));
  } else {
    Server.app.use(favicon(joinPath(dashboardPublic, "images", "favicon.ico")));
  }

  // Static files server
  Server.app.use("/public", express.static(usersPublic));
  Server.app.use("/public", express.static(dashboardPublic, cacheConfig));
  Server.app.use("/_runtime", express.static(BrowserifyCompiler.userDir));

  logger.debug("%p%P Static file server at %s", 3, 0);
  logger.debug("%p%P [GET]%s", 5, 0, usersPublic);
  logger.debug("%p%P [GET]%s", 5, 0, dashboardPublic);
};
