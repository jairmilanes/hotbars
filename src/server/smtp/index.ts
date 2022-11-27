/* eslint-disable @typescript-eslint/ban-ts-comment */
import * as _ from "lodash";
import {
  SMTPServer,
  SMTPServerAddress,
  SMTPServerAuthentication,
  SMTPServerAuthenticationResponse,
  SMTPServerDataStream,
  SMTPServerSession,
} from "smtp-server";
import { simpleParser, Headers, ParsedMail, HeaderValue } from "mailparser";
import { logger } from "../../services";
import { SMTPServerException } from "../exceptions";
import { Config } from "../core";
import { SMTPServerConfig } from "../types";
import JsonDbAdaptor from "../data/adaptor/jsonDb.adaptor";
import { createJsonRouter } from "../services";

export class FakeSMPTServer {
  private static instance: FakeSMPTServer;

  private readonly server: SMTPServer;

  maxAllowedUnauthenticatedCommands = 1000;

  private readonly _db: JsonDbAdaptor;

  private router: any;

  private readonly config: SMTPServerConfig;

  constructor() {
    this.config = Config.get("smtpServer");
    logger.debug(`%p%P Fake SMTP server %O`, 1, 1, this.config);

    this.router = createJsonRouter({
      mails: [],
    });

    this._db = new JsonDbAdaptor(this.router.db, "mails");

    this.server = new SMTPServer({
      size: 1024,
      secure: false,
      authOptional: true,
      allowInsecureAuth: true,
      disabledCommands: ["STARTTLS"],
      onAuth: this.onAuth.bind(this),
      onMailFrom: this.onMailFrom.bind(this),
      onData: this.onData.bind(this),
      onRcptTo: this.onRcptTo.bind(this),
      onConnect: this.onConnect.bind(this),
    });

    this.server.on("error", this.onError.bind(this));
  }

  static create(): void {
    this.instance = new FakeSMPTServer();
  }

  static listen() {
    logger.debug(`%p%P Fake SMTP starting...`, 1, 1);

    this.instance.server.listen(
      this.instance.config.port,
      this.instance.config.host,
      () => {
        logger.log("SMTP Server listening on %s", this.instance.config.port);
      }
    );
  }

  static get router() {
    return this.instance.router;
  }

  static get db(): JsonDbAdaptor {
    return this.instance._db;
  }

  private onError(err: Error) {
    logger.error("SMTP Server error %O", err);
  }

  private onConnect(
    session: SMTPServerSession,
    callback: (err?: Error | null) => void
  ) {
    logger.debug(`%p%P SMTP connected %o`, 1, 1, session);
    callback();
  }

  private onMailFrom(
    address: SMTPServerAddress,
    session: SMTPServerSession,
    callback: (err?: Error | null) => void
  ) {
    const { whitelist } = this.config;

    if (whitelist.length === 0 || whitelist.indexOf(address.address) !== -1) {
      callback();
    } else {
      callback(new Error("Invalid email from: " + address.address));
    }
  }

  private onAuth(
    auth: SMTPServerAuthentication,
    session: SMTPServerSession,
    callback: (
      err: Error | null | undefined,
      response?: SMTPServerAuthenticationResponse
    ) => void
  ) {
    if (!this.config.auth) {
      logger.info("SMTP authentication not set, using anonimous.");
      return callback(
        new SMTPServerException("Credentials not provided.", 535)
      );
    }

    logger.info("SMTP login for user: " + auth.username);

    const {
      auth: { username, password },
    } = this.config;

    if (auth.username !== username || auth.password !== password) {
      return callback(
        new SMTPServerException("Invalid username or password", 535)
      );
    }

    callback(null, {
      user: username,
    });
  }

  private onRcptTo(
    address: SMTPServerAddress,
    session: SMTPServerSession,
    callback: (err?: Error | null) => void
  ) {
    // do not accept messages larger than 100 bytes to specific recipients
    const size = _.get(session.envelope.mailFrom, "args.SIZE", 0);

    // address.address === "almost-full@example.com" &&
    if (Number(size) > 100) {
      return callback(
        new SMTPServerException(
          `Insufficient channel storage: ${address.address}`,
          452
        )
      );
    }

    callback();
  }

  private async onData(
    stream: SMTPServerDataStream,
    session: SMTPServerSession,
    callback: (err?: Error | null) => void
  ) {
    const mail = await this.parseEmail(stream);
    logger.debug("%p%P Email received");

    await this._db.insert(mail);

    this._db.size();

    await this.cleanUp();

    callback();
  }

  private async cleanUp() {
    // Clean up excess messages
    const diff = this._db.size() - this.config.emailsLimit;

    if (diff > 0) {
      const all = await this._db.all();

      const trash = all.slice(all.length - diff, all.length);

      for (let i = 0; i < trash.length; i++) {
        await this._db.delete(trash[i]["id"]);
      }
    }
  }

  private formatHeaders(headers: Headers): Headers {
    const result: Map<string, HeaderValue> = new Map();

    for (const [key, value] of headers) {
      result.set(key, value);
    }

    return result;
  }

  private async parseEmail(stream: SMTPServerDataStream): Promise<ParsedMail> {
    const email = await simpleParser(stream);

    if (this.config.keepHeaders) {
      email.headers = this.formatHeaders(email.headers);
    } else {
      _.unset(email, "headers");
    }

    return email;
  }
}
