import { Request } from "express";
import { Config } from "./config";
import { DashboardConfig } from "./dashboard-config";
import { ConfigManager } from "../services/config-manager";

export class ContextConfig extends ConfigManager {
  static init(req: Request | boolean): Readonly<ConfigManager> {
    if (typeof req === "boolean") {
      this.instance = req ? DashboardConfig as unknown as Readonly<ConfigManager> : Config as unknown as Readonly<ConfigManager>;
      return this.instance;
    }

    if (req.originalUrl.startsWith("/_hotbars")) {
      this.instance = DashboardConfig as unknown as Readonly<ConfigManager>;
    } else {
      this.instance = Config as unknown as Readonly<ConfigManager>;
    }

    return this.instance
  }
}