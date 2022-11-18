import { User } from "../../../types";
import { DataManager } from "../../data";
import { Config } from "../../core";
import { LocalAuthStrategyAbstract } from "./local.strategy.abstract";

export abstract class JsonDbAuthStrategy extends LocalAuthStrategyAbstract {

  protected constructor() {
    super("jsonDb");
  }

  async getUser(username: string): Promise<User> {
    const usersDb = DataManager.get().from(
      Config.get<string>("auth.usersTable")
    );

    const record = await usersDb
      .eq(Config.get<string>("auth.usernameColumn"), username)
      .single()

    return record as User;
  }
}
