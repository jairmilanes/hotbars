import { Strategy as RememberMeStrategy } from "@jmilanes/passport-remember-me";
import { decodeBase64, encodeBase64 } from "bcryptjs";
import { DataManager } from "../../data";
import { LocalAuthStrategy } from "./local.strategy";
import { AuthDoneCallback } from "../../types";
import { Config } from "../../core";
import { logger } from "../../../services";

export class RememberMeAuthStrategy extends LocalAuthStrategy {
  private enconder = new TextEncoder();
  private decoder = new TextDecoder();

  constructor() {
    super("rememberMe");
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  createStrategy() {
    const strat = new RememberMeStrategy(
      {
        key: this.name,
        cookie: { maxAge: Config.get<number>("auth.rememberMe") },
      },
      this.verifyToken.bind(this),
      this.issueToken.bind(this)
    );
    strat.name = this.name;
    return strat;
  }
  async issueToken(
    uid: string,
    done: (error?: Error, token?: string) => void
  ): Promise<string | Error | undefined> {
    try {
      if (uid) {
        const encoded = this.enconder.encode(uid);
        const token = encodeBase64(encoded, encoded.length);

        logger.info("-- Token issued", token);
        await this.updateUser(uid, { remember: token });
        done(undefined, token);
        return token;
      }
      done();
    } catch (e) {
      done(e as Error);
      return e as Error;
    }
  }

  async verifyToken(token: string, done: AuthDoneCallback<any>) {
    try {
      const encodedUid: number[] = decodeBase64(token, token.length);

      logger.info("Verifying token", encodedUid);

      if (!encodedUid) {
        return done(null, false);
      }

      const uid = this.decoder.decode(Buffer.from(encodedUid));

      logger.info("-- Token user id", uid);

      const user = await DataManager.get().from("users").get(uid);

      logger.info("-- Token user", user);

      if (!user) {
        return done(null, false);
      }

      await this.updateUser(uid, { remember: null });

      return done(null, user);
    } catch (e) {
      return done(e as Error);
    }
  }
}
