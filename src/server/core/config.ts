/* eslint-disable @typescript-eslint/no-explicit-any */
import * as _ from "lodash";
import { loadFile } from "../services";
import { joinPath, slash } from "../utils";
import {
  AuthConfig,
  AutoRouteConfig,
  Browser,
  CliOptions,
  CorsConfig,
  Env,
  HTTPProtocol,
  JsonServerConfig,
  LanguageConfig,
  MailerConfig,
  Options,
  SMTPServerConfig,
  StylesType,
  UploadsConfig,
} from "../types";
import { initLogger } from "../../services";
import { ConfigManager } from "../services/config-manager";
import * as process from "process";
import { existsSync } from "fs";
import { ConfigFileException } from "../exceptions/config-file.exception";
import { DashboardConfig } from "./dashboard-config";

const moduleName = "hotbars";

export class Config extends ConfigManager implements Options {
  dev = false;
  root = slash(process.cwd());
  env = Env.Dev;
  port = 3000;
  socketPort = 5001;
  browser?: Browser;
  logLevel = 1;
  verbose = false;
  activeData = false;
  logToFile = true;
  configName = `${moduleName}rc`;
  bootstrapName = `${moduleName}.bootstrap`;
  routesConfigName = `${moduleName}.routes`;
  encoding = "utf-8" as BufferEncoding;
  protocol = "http" as HTTPProtocol;
  host = "127.0.0.1";
  extname = "hbs";
  source = "src";
  jsonSchema = "schema";
  jsonDb = undefined;
  data = "data";
  helpers = "helpers";
  layouts = "layouts";
  partials = "partials";
  precompile = "precompile";
  shared = "shared";
  views = "views";
  lib = "lib";
  controllers = "controllers";
  styleMode = "css" as StylesType;
  styles = "styles";
  public = "public";
  scripts = "scripts";
  partialsOptions = {};
  ignore: string[] = [];
  serverUrl = "";
  ignorePattern?: RegExp;
  language: LanguageConfig = {
    enabled: false,
    languages: ["en"],
    default: "en",
  };
  mailer: MailerConfig = {
    enabled: false,
    smtp: {
      port: 587,
      host: "",
      from: "",
      username: "",
      password: "",
    },
    source: "email",
    data: "data",
    partials: "partials",
    layouts: "layouts",
    templates: "templates",
  };
  smtpServer: SMTPServerConfig = {
    enabled: false,
    port: 2525,
    host: "127.0.0.1",
    whitelist: [],
    keepHeaders: false,
    emailsLimit: 100,
    maxMessageSize: 1024,
    auth: {
      username: "admin",
      password: "admin",
    },
  };
  jsonServer: JsonServerConfig = {
    enabled: false,
  };
  uploads: UploadsConfig = {
    enabled: false,
    path: "uploads/",
    limit: 10,
    maxFileSize: 1048576,
    types: [],
  };
  cors: CorsConfig = {
    enabled: false,
    origin: false,
    credentials: false,
  };
  auth: AuthConfig = {
    enabled: false,
    path: "auth",
    securePath: "secure",
    usersTable: "users",
    usernameColumn: "username",
    emailColumn: "email",
    passwordColumn: "password",
    confirmEmail: true,
    reCaptcha: "v2",
    rememberMe: 604800000,
    terms: undefined,
    views: {
      signInRedirect: "/",
      signUpRedirect: "/",
      signIn: "_sign-in",
      signUp: "_sign-up",
      signUpPending: "_sign-up-pending",
      signOut: "_sign-out",
      passwordRecovery: "_password-recovery",
      passwordRecovered: "_password-recovered",
      passwordReset: "_password-reset",
    },
    session: {
      secret: "keyboard cat",
      saveUninitialized: false,
      resave: false,
      cookie: {
        secure: false,
        maxAge: 60 * 60 * 1000,
      },
    },
  };
  autoroute: AutoRouteConfig = {
    methods: ["get"],
    login: ["get", "post"],
  };
  watch: string[] = [];

  static instance: Readonly<Config>;
  static dashboard: Readonly<DashboardConfig>;

  private constructor(argv: CliOptions) {
    super();

    const configFile = argv.configName || this.configName;

    if (!existsSync(joinPath(process.cwd(), configFile))) {
      throw new ConfigFileException(configFile);
    }

    const userConfig = loadFile<Partial<Options>>(
      configFile,
      true,
      undefined,
      process.cwd()
    );

    const options = _.assign({}, userConfig, argv);

    // Normalize environment naming
    if (options.env === "dev") {
      options.env = Env.Dev;
    }

    if (options.env === "prod") {
      options.env = Env.Prod;
    }

    const production = options.env === Env.Prod;

    const cors: CorsConfig = {
      enabled: production,
      origin: production,
      credentials: production,
    };

    _.merge(this, options, { cors });

    if (this.auth.https && !this.auth.session.cookie?.secure) {
      _.set(this.auth, "session.cookie.secure", true);
    }

    if (this.mailer.enabled) {
      _.merge(this.mailer.smtp, {
        host: process.env.EMAIL_SMTP_HOST as string,
        port: process.env.EMAIL_SMTP_PORT
          ? parseInt(process.env.EMAIL_SMTP_PORT, 10)
          : undefined,
        username: process.env.EMAIL_SMTP_USERNAME,
        password: process.env.EMAIL_SMTP_PASSWORD,
        from: process.env.EMAIL_SMTP_FROM,
      });
    }

    ["data", "partials", "layouts", "templates"].forEach((name) =>
      _.set(
        this.mailer,
        name,
        joinPath(this.mailer.source, _.get(this.mailer, name))
      )
    );

    this.set("currentLanguage", this.language.default);

    if (!production) {
      this.watch = [
        this.relPath("routesConfigName", ".js"),
        this.relPath("routesConfigName", ".cjs"),
        this.relGlobPath("data"),
        this.relGlobPath("helpers"),
        this.relGlobPath("layouts"),
        this.relGlobPath("partials"),
        this.relGlobPath("precompile"),
        this.relGlobPath("shared"),
        this.relGlobPath("views"),
        this.relGlobPath("controllers"),
        this.relPath("mailer.source"),
        this.relGlobPath("styles"),
        this.relGlobPath("public", this.scripts, ".js"),
        this.relGlobPath("public", this.styles, ".css"),
      ];

      if (this.auth.enabled) {
        this.watch.push(this.relGlobPath("auth.path"));
      }
    }

    if (this.ignorePattern) {
      this.ignorePattern = new RegExp(this.ignorePattern);
    }

    if (Array.isArray(this.ignore)) {
      this.ignore = this.ignore.map((relativePath: string) => {
        return joinPath(this.root, relativePath);
      });
    }
  }

  static create(argv?: CliOptions): Readonly<Config> {
    this.instance = new this(argv || {});

    initLogger(this.instance.logLevel, this.instance.logToFile);

    return Object.freeze(this.instance);
  }

  static addToWatch(path: string) {
    this.instance.watch.push(
      joinPath(...[this.instance.source, path])
    )
  }
}
