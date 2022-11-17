import { User } from "../../../types";
import { DataManager } from "../../data";
import { Config } from "../../core";
import { LocalAuthStrateygyAbstract } from "./local.strateygy.abstract";

export abstract class JsonDbAuthStrateygy extends LocalAuthStrateygyAbstract {
  async getUser(username: string): Promise<User> {
    const usersDb = DataManager.get().from(
      Config.get<string>("auth.usersTable")
    );
    return usersDb
      .eq(Config.get<string>("auth.usernameColumn"), username)
      .single();
  }
}
