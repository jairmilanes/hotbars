import express from "express";
import favicon from "serve-favicon";
import { existsSync } from "fs";
import { Config, DashboardConfig, Server } from "../../core";
import { joinPath } from "../../utils";
import { getServerDataDir } from "../../utils/get-server-data-dir";
import { Env } from "../../types";

export const staticFilesHandler = () => {
  // const { source, public: publicDir } = Config.get<Config>();

  const usersOptions = {
    maxAge: Config.get("env") !== Env.Local ? "3h" : 0
  };

  const dashboardOptions = {
    maxAge: DashboardConfig.get("env") !== Env.Local ? "3h" : 0
  };

  const usersPublic = Config.fullPath("public");
  const appPublic = Config.fullPath("app");
  const dashboardPublic = DashboardConfig.fullPath("public");
  const dashboardAppPublic = DashboardConfig.fullPath("app");

  // Favicon server
  if (existsSync(joinPath(usersPublic, "images", "favicon.ico"))) {
    Server.app.use(favicon(joinPath(usersPublic, "images", "favicon.ico")));
  } else {
    Server.app.use(favicon(joinPath(dashboardPublic, "images", "favicon.ico")));
  }

  const pt = Config.get("uploads.path")
  if (pt) {
    const uploadsPath = joinPath(Config.get("root"), Config.get("uploads.path"))
    Server.app.use("/public", express.static(uploadsPath, usersOptions));
  }

  // Static files server
  Server.app.use("/public", express.static(usersPublic, usersOptions));
  Server.app.use("/public", express.static(dashboardPublic, dashboardOptions));
  Server.app.use("/app", express.static(appPublic, dashboardOptions));
  Server.app.use("/app", express.static(dashboardAppPublic, dashboardOptions));
  Server.app.use("/runtime", express.static(getServerDataDir("public")));
};
