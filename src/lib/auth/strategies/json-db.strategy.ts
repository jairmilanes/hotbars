import { LocalAuthStrateygyAbstract } from "./local.strateygy.abstract";
import { User } from "../../../types";
import { DataManager } from "../../data";

export abstract class JsonDbAuthStrateygy extends LocalAuthStrateygyAbstract {
  async getUser(username: string): Promise<User> {
    const usersDb = DataManager.get("lowDb").from("user");
    return usersDb.eq("userName", username).single();
  }
}
