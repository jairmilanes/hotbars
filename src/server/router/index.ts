import * as _ from "lodash";
import { Config, Server } from "../core";
import cors from "cors";
import express from "express";
import { logger } from "../../services";
import { CorsConfig, RouteMap } from "../types";
import { mountRoutes } from "./middleware";

export class Router {
  configure(): void {
    logger.debug(`HTTP Router...`);

    /**
     * Configure CORS, possibily dynamic if whitelist is set.
     */
    if (Config.enabled("cors")) {
      const corsConfig = Config.get<CorsConfig>("cors");

      if (_.isArray(corsConfig.whitelist)) {
        corsConfig.origin = (origin, callback) => {
          if (_.indexOf(corsConfig.whitelist, origin) > -1) {
            callback(null, true);
          } else {
            callback(new Error("Not allowed by CORS"));
          }
        };
      }

      Server.app.use(cors(corsConfig));

      logger.debug("%p%P CORS enabled %o", 1, 1, corsConfig);
    }

    if (Config.get("env") === "production") {
      // @todo better understand this setting
      Server.app.set("trust proxy", 1); // trust first proxy
    }

    Server.app.use(express.urlencoded({ extended: true, limit: "10mb" }));
    Server.app.use(express.json({ limit: "10mb" }));
    Server.app.use(express.raw());

    logger.debug("%p%P Body parsers, max payload size 10mb", 1, 1);

    logger.debug(`%p%P Registering handlers...`, 1, 1);
    mountRoutes();

    Server.mapRoutes();

    this.logRoutes()
  }

  groupRoutes() {
    return Server.routes.reduce((ac, route) => {
      const authRoutes = [
        "_sign-in", "_sign-up", "_sign-out", "_password", "re-captcha"
      ]

      if (authRoutes.find(name => route.slug.startsWith(name))) {
        const authRoute = ac.find(rt => rt.source === "auth")

        if (authRoute) {
          authRoute.routes?.push(route)
        } else {
          ac.push({
            index: -1,
            type: "router",
            path: "",
            slug: "auth",
            source: "auth",
            method: "GET",
            routes: [
              route
            ]
          })
        }
      } else if (route.slug === "_partial") {
        ac.push({
          index: -1,
          type: "router",
          path: "",
          slug: "partial",
          source: "partial",
          method: "GET",
          routes: [
            route
          ]
        })
      } else if (route.type === "static") {
        const staticRoute = ac.find(rt => rt.source === "static")

        if (staticRoute) {
          staticRoute.routes?.push(route)
        } else {
          ac.push({
            index: -1,
            type: "router",
            path: "",
            slug: "static",
            source: "static",
            method: "GET",
            routes: [
              route
            ]
          })
        }
      } else {
        ac.push(route)
      }

      return ac
    }, [] as RouteMap[])
  }

  logRoutes() {
    this.groupRoutes().forEach(route => {
      this.logRoute(route)
    })
  }

  logRoute(route: RouteMap, level = 1) {
    // logger.debug(route)

    if (route.type === "middleware") {
      logger.debug("%p%P [%s][%s]%s", (level * 2), 1, "Middleware", route.slug, `${this.getPrefix(route)}${route.path || ""}`)
      return;
    }

    if (route.type === "router") {
      const prefix = this.getGroup(route)

      if (level === 1) {
        logger.debug("%p%P %s", (level * 2), 1, prefix)
      }

      if (Array.isArray(route.routes)) {
        route.routes.forEach((subRoute) => {
          this.logRoute(subRoute, level + 1)
        })
      }
      return;
    }

    if (route.type === "route") {
      if (Array.isArray(route.methods)) {
        route.methods.forEach(method => {
          logger.debug("%p%P [%s]%s", (level * 2), 0, method, `${this.getPrefix(route)}${route.path}`)
        })
      } else {
        logger.debug("%p%P [%s]%s", (level * 2), 0, route.method, `${this.getPrefix(route)}${route.path}`)
      }
      return;
    }
  }

  getPrefix(route: RouteMap) {
    if (route.prefix && route.prefix !== "/") {
      if (route.prefix.endsWith("/")) {
        return route.prefix.substring(0, route.prefix.length - 1)
      }
      return route.prefix
    }
    return ""
  }

  getGroup(route: RouteMap) {
    if (route.type === "middleware") {
      return "Middleware"
    }

    if (route.slug.startsWith("_mail")) {
      return "Mail"
    }

    if (route.source === "lighthouse") {
      return "Lighthouse"
    }

    if (route.source === "dashboard") {
      return "Dashboard"
    }

    if (route.source === "pages") {
      return "Pages"
    }

    if (route.source === "user") {
      return "User"
    }

    if (route.source === "auth") {
      return "Auth"
    }

    if (route.source === "static") {
      return "Static"
    }

    if (route.source === "partial") {
      return "Partials"
    }

    if (route.source === "smtpDb") {
      return "SMTP Server"
    }

    if (route.source === "git") {
      return "Git"
    }

    if (route.slug === "_precompiled") {
      return "Precompiled"
    }

    if (route.slug === "_api") {
      return "API"
    }

    if (route.slug === "_partial") {
      return "Partial"
    }

    const authRoutes = [
      "_sign-in", "_sign-out", "_sign-in", "_password", "re-captcha"
    ]

    if (authRoutes.find(name => route.slug.startsWith(name))) {
      return "Auth"
    }

    if (route.slug === "*") {
      return "Catch All"
    }

    const errorRoutes = [
      "not-found", "error"
    ]

    if (errorRoutes.find(name => route.slug.startsWith(name))) {
      return "Error"
    }
  }
}
