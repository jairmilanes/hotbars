import express from "express";
import favicon from "serve-favicon";
import { existsSync } from "fs";
import { Config, DashboardConfig, Server } from "../../core";
import { joinPath } from "../../utils";
import { getServerDataDir } from "../../utils/get-server-data-dir";
import { Env } from "../../types";

export const staticFilesHandler = () => {
  const { source, public: publicDir } = Config.get();

  const usersOptions = {
    maxAge: Config.get("env") !== Env.Dev ? "3h" : 0
  };

  const dashboardOptions = {
    maxAge: DashboardConfig.get("env") !== Env.Dev ? "3h" : 0
  };

  const usersPublic = joinPath(source, publicDir);
  const dashboardPublic = DashboardConfig.fullPath("public");

  // Favicon server
  if (existsSync(joinPath(usersPublic, "images", "favicon.ico"))) {
    Server.app.use(favicon(joinPath(usersPublic, "images", "favicon.ico")));
  } else {
    Server.app.use(favicon(joinPath(dashboardPublic, "images", "favicon.ico")));
  }

  // Static files server
  Server.app.use("/public", express.static(usersPublic, usersOptions));
  Server.app.use("/public", express.static(dashboardPublic, dashboardOptions));
  Server.app.use("/_runtime", express.static(getServerDataDir("public")));
};
