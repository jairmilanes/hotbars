import { DataManager } from "../../data";
import { Config } from "../../core";
import { LocalAuthStrategy } from "./local.strategy";

export abstract class JsonDbAuthStrategy extends LocalAuthStrategy {
  protected constructor(name?: string) {
    super(name || "jsonDb");
  }

  protected get db() {
    return DataManager.get("jsonDb").from(
      Config.get<string>("auth.usersTable")
    );
  }
}
