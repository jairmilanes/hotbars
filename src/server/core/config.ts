/* eslint-disable @typescript-eslint/no-explicit-any */
import * as _ from "lodash";
import { loadFile } from "../services";
import { joinPath, slash } from "../utils";
import {
  AuthConfig,
  AutoRouteConfig,
  Browser, CacheConfig,
  CliOptions,
  CorsConfig, DeploymentConfig,
  Env,
  HTTPProtocol,
  JsonServerConfig,
  LanguageConfig,
  MailerConfig,
  Options,
  SMTPServerConfig,
  StylesType,
  UploadsConfig
} from "../types";
import { initLogger } from "../../services";
import { ConfigManager } from "../services/config-manager";
import * as process from "process";
import { existsSync } from "fs";
import { ConfigFileException } from "../exceptions/config-file.exception";
import { DashboardConfig } from "./dashboard-config";

const moduleName = "hotbars";

export class Config extends ConfigManager implements Options {
  debug = false;
  base = "/";
  root = slash(process.cwd());
  env = Env.Local;
  port = 3000;
  socketPort = 5001;
  browser?: Browser;
  logLevel = 1;
  verbose = false;
  activeData = false;
  logToFile = true;
  configName = `.${moduleName}rc`;
  bootstrapName = `${moduleName}.bootstrap`;
  routesConfigName = `${moduleName}.routes`;
  encoding = "utf-8" as BufferEncoding;
  protocol = "http" as HTTPProtocol;
  host = "127.0.0.1";
  extname = "hbs";
  source = "src";
  jsonSchema = "schema";
  jsonDb = undefined;
  app = "app";
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
  cache: CacheConfig = {
    enabled: true,
    type: "file",
    expire: 8600
  };
  deployment: DeploymentConfig = {
    enabled: false,
    service: "heroku",
    region: "us"
  }
  language: LanguageConfig = {
    enabled: false,
    options: [
      {
        name: "English",
        code: "en",
        date: {
          format: "LLL"
        },
        currency: {
          sign: "$",
          code: "USD"
        }
      }
    ],
    default: {
      name: "English",
      code: "en",
      date: {
        format: "LLL"
      },
      currency: {
        sign: "$",
        code: "USD"
      }
    }
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
    path: "uploads",
    limit: 10,
    maxFileSize: 4e+6,
    types: [],
  };
  cors: CorsConfig = {
    enabled: false,
    origin: false,
    credentials: false,
  };
  git = {
    name: undefined,
    repo: undefined,
    org: undefined,
    remote: undefined
  };
  auth: AuthConfig = {
    enabled: false,
    path: "auth",
    securePath: "secure",
    usersTable: "__users",
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

    const local = options.env === Env.Local;

    const cors: CorsConfig = {
      enabled: !local,
      origin: !local,
      credentials: !local,
    };

    _.merge(this, options, { cors, dev: false });

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

    _.set(
      this.customProps,
      "currentLanguage",
      this.language.default
    );

    this.watch = [
      this.fullGlobPath("routesConfigName", ".js"),
      this.fullGlobPath("routesConfigName", ".cjs"),
      this.fullGlobPath("data"),
      this.fullGlobPath("helpers"),
      this.fullGlobPath("layouts"),
      this.fullGlobPath("partials"),
      this.fullGlobPath("precompile"),
      this.fullGlobPath("shared"),
      this.fullGlobPath("views"),
      this.fullGlobPath("controllers"),
      this.fullGlobPath("mailer.source"),
      this.fullGlobPath("styles"),
      this.fullGlobPath("public", this.scripts, ".js"),
      this.fullGlobPath("public", this.styles, ".css"),
    ];

    if (this.auth.enabled) {
      this.watch.push(this.fullGlobPath("auth.path"));
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
      joinPath(this.instance.root, this.instance.source, path)
    )
  }
}
