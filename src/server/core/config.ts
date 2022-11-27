/* eslint-disable @typescript-eslint/no-explicit-any */
import * as _ from "lodash";
import get from "lodash/get";
import set from "lodash/set";
import { loadFile } from "../services";
import { joinPath, resolvePath } from "../utils";
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
  OptionalFeature,
  Options,
  SafeAny,
  SafeObject,
  SMTPServerConfig,
  SMTPServerCredentials,
  StylesType,
  UploadsConfig,
} from "../types";
import { initLogger } from "../../services";

const moduleName = "hotbars";

export class Config implements Options {
  env = Env.Dev;
  port = 3000;
  socketPort = 5001;
  browser?: Browser;
  logLevel = 1;
  verbose = false;
  activeData = false;
  logFilePath = "./logs/log.txt";
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
  controllers = "controllers";
  styleMode = "css" as StylesType;
  styles = "styles";
  public = "public";
  partialsOptions = {};
  ignore: string[] = [];
  dev = false;
  serverUrl = "";
  ignorePattern?: RegExp;
  root = process.cwd();
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
    data: "email/data",
    partials: "email/partials",
    layouts: "email/layouts",
    templates: "email/templates",
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
    passwordColumn: "password",
    session: {
      secret: "keyboard cat",
      saveUninitialized: true,
      resave: true,
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
  serverRoot = resolvePath(__dirname, "..", "..", "..");
  serverData = resolvePath(__dirname, "..", "..", "client/_data");
  serverPrecompile = resolvePath(__dirname, "..", "..", "client/_precompile");
  serverShared = resolvePath(__dirname, "..", "..", "client/_shared");
  serverLayouts = resolvePath(__dirname, "..", "..", "client/_layouts");
  serverPartials = resolvePath(__dirname, "..", "..", "client/_partials");
  serverViews = resolvePath(__dirname, "..", "..", "client/_views");
  serverHelpers = resolvePath(__dirname, "..", "..", "client/_helpers");
  serverScripts = resolvePath(__dirname, "..", "..", "client/_scripts");
  serverStyles = resolvePath(__dirname, "..", "..", "client/_styles");

  serverMailData = resolvePath(__dirname, "..", "..", "client/_mail/data");
  serverMailLayouts = resolvePath(
    __dirname,
    "..",
    "..",
    "client/_mail/layouts"
  );
  serverMailPartials = resolvePath(
    __dirname,
    "..",
    "..",
    "client/_mail/partials"
  );
  serverMailTemplates = resolvePath(
    __dirname,
    "..",
    "..",
    "client/_mail/templates"
  );
  watch: string[] = [];

  private customProps: SafeObject = {};

  private static instance: Readonly<Config>;

  private constructor(argv: CliOptions) {
    const userConfig = loadFile<Partial<Options>>(
      argv.configName || this.configName,
      true
    );
    const options = _.merge(userConfig, argv);
    const production = options.env === Env.Prod;

    const cors: CorsConfig = {
      enabled: production,
      origin: production,
      credentials: production,
    };

    _.merge(this, { cors }, options);

    /* if (this.env === Env.Dev && !this.browser) {
      this.browser =
        Os.platform() === "darwin" ? Browser.Safari : Browser.Chrome;
    } */

    if (this.auth.https && !this.auth.session.cookie?.secure) {
      _.set(this.auth, "session.cookie.secure", true);
    }

    if (this.mailer.enabled) {
      if (process.env.EMAIL_SMTP_HOST)
        this.mailer.smtp.host = process.env.EMAIL_SMTP_HOST;
      if (process.env.EMAIL_SMTP_PORT)
        this.mailer.smtp.port = parseInt(process.env.EMAIL_SMTP_PORT, 10);
      if (process.env.EMAIL_SMTP_USERNAME)
        this.mailer.smtp.username = process.env.EMAIL_SMTP_USERNAME;
      if (process.env.EMAIL_SMTP_PASSWORD)
        this.mailer.smtp.password = process.env.EMAIL_SMTP_PASSWORD;
      if (process.env.EMAIL_SMTP_FROM)
        this.mailer.smtp.from = process.env.EMAIL_SMTP_FROM;
    }

    if (this.language.default) {
      this.set("currentLanguage", this.language.default);
    }

    if (!production) {
      this.watch = [
        this.relPath("routesConfigName", "js"),
        this.relPath("routesConfigName", "cjs"),
        this.relGlobPath("data"),
        this.relGlobPath("helpers"),
        this.relGlobPath("layouts"),
        this.relGlobPath("partials"),
        this.relGlobPath("precompile"),
        this.relGlobPath("shared"),
        this.relGlobPath("views"),
        this.relGlobPath("controllers"),
        this.relGlobPath("styles"),
        this.relPath("public", `/${this.styles}/**/*.css`),
      ];

      if (this.auth.enabled) {
        this.watch.push(this.relGlobPath("auth.path"));
      }
    }

    if (this.dev) {
      this.watch.push(this.globPath(this.serverData, "json"));
      this.watch.push(this.globPath(this.serverHelpers, "js"));
      this.watch.push(this.globPath(this.serverLayouts, "hbs"));
      this.watch.push(this.globPath(this.serverPartials, "hbs"));
      this.watch.push(this.globPath(this.serverShared, "hbs"));
      this.watch.push(this.globPath(this.serverViews, "hbs"));
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

  static create(argv: CliOptions): Readonly<Config> {
    this.instance = new this(argv);

    initLogger(Config.get("logLevel"), Config.get("logFilePath"));

    return Object.freeze(this.instance);
  }

  static get(): Readonly<Config>;
  static get<T>(key?: string): T;
  static get<T>(key?: string): T | Readonly<Config> {
    if (key) {
      return this.instance.get<T>(key);
    }
    return this.instance as Readonly<Config>;
  }

  static set(key: string, value: any) {
    this.instance.set(key, value);
  }

  static value<T>(key: keyof Config): T {
    return this.instance.get<T>(key) as T;
  }

  static is(key: string, value: any): boolean {
    return this.instance.is(key, value);
  }

  static fullPath(name: string, ext?: string): string {
    return this.instance.fullPath(name, ext);
  }

  static relPath(name: string, ext?: string): string {
    return this.instance.relPath(name, ext);
  }

  static relGlobPath(name: string, ext?: string): string {
    return this.instance.relGlobPath(name, ext);
  }

  static fullGlobPath(name: string, ext?: string): string {
    return this.instance.fullGlobPath(name, ext);
  }

  static globPath(base: string, ext?: string): string {
    return this.instance.globPath(base, ext);
  }

  static enabled(name: string): boolean {
    const option = this.instance[name as keyof Config] as OptionalFeature;
    return option.enabled;
  }

  set(key: string, value: SafeAny): void {
    set(this.customProps, key, value);
  }

  get<T = SafeAny>(key: string): T {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return (get(this, key) as T) || (get(this.customProps, key) as T);
  }

  is(key: string, value: any): boolean {
    return this.get(key) === value;
  }

  fullPath(name: string, ext?: string): string {
    if (ext && ext.indexOf("/") < 0 && !ext.startsWith(".")) ext = `.${ext}`;
    return resolvePath(
      this.root,
      this.source,
      this.get<string>(name).concat(ext || "")
    );
  }

  relPath(name: string, ext?: string): string {
    if (ext && ext.indexOf("/") < 0 && !ext.startsWith(".")) ext = `.${ext}`;
    return joinPath(this.source, this.get<string>(name).concat(ext || ""));
  }

  relGlobPath(name: string, ext?: string) {
    return this.globPath(this.relPath(name), ext);
  }

  fullGlobPath(name: string, ext?: string): string {
    const base = !name.startsWith("server")
      ? this.fullPath(name)
      : this.get<string>(name);
    return this.globPath(base, ext);
  }

  enabled(name: string): boolean {
    const option = this.get(name) as OptionalFeature;
    return "enabled" in option && option.enabled;
  }

  globPath(base: string, ext?: string): string {
    const pattern = "/**/*.%s";
    const target = base.split("/").pop();

    switch (target) {
      case "data":
        return `${base}${pattern.replace("%s", "{json,js,cjs}")}`;
      case "helpers":
      case "controllers":
      case "auth":
        return `${base}${pattern.replace("%s", "{js,cjs}")}`;
      case "styles":
        return `${base}${pattern.replace("%s", "{css,scss}")}`;
      default:
        if (ext) {
          return `${base}${pattern.replace("%s", ext)}`;
        }
        return `${base}${pattern.replace("%s", this.extname)}`;
    }
  }
}
