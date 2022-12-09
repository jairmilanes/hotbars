import * as _ from "lodash";
import { NewUser, User } from "../../types";
import { DataManager } from "../../data";
import { Config } from "../../core";
import { LocalAuthStrategyAbstract } from "./local.strategy.abstract";
import { logger } from "../../../services";

export abstract class JsonDbAuthStrategy extends LocalAuthStrategyAbstract {
  protected constructor(name?: string) {
    super(name || "jsonDb");
  }

  async getUser(username: string): Promise<User> {
    const usersDb = DataManager.get("jsonDb").from(
      Config.get<string>("auth.usersTable")
    );

    const record = await usersDb
      .eq(Config.get<string>("auth.usernameColumn"), username)
      .single();

    return record as User;
  }

  async createUser(data: Record<string, any>) {
    const profile = _.pick(data, ["username", "email", "password"]) as NewUser;

    const usersDb = DataManager.get("jsonDb").from(
      Config.get<string>("auth.usersTable")
    );

    const user = (await usersDb.insert({
      confirmed: false,
      provider: "jsonDb",
      ...profile,
    })) as User;

    logger.debug("User created %O", user);

    return user;
  }

  async confirmEmail(username: string): Promise<User> {
    const usersDb = DataManager.get("jsonDb").from(
      Config.get<string>("auth.usersTable")
    );

    const user = await usersDb.eq("username", username).single();

    if (!user) {
      throw new Error(`User ${username} not found!`);
    }

    const { id, ...profile } = user;

    const updated = (await usersDb.update(id, {
      ...profile,
      confirmed: true,
    })) as User;

    logger.debug("User updated %O", updated);

    return updated;
  }
}
