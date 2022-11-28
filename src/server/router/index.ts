import * as _ from "lodash";
import { Config, Server } from "../core";
import cors from "cors";
import express from "express";
import { logger } from "../../services";
import { CorsConfig } from "../types";
import { mountRoutes } from "./middleware";

export class Router {
  configure(): void {
    logger.info(`Configuring router...`);

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

    logger.info(`%p%P Registering handlers...`, 1, 1);
    mountRoutes();

    Server.mapRoutes();
  }
}
