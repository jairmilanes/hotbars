import * as _ from "lodash";
import {
  AuthConfig,
  BaseOptions,
  CliOptions,
  Env,
  LanguageConfig,
  MailerConfig,
  StylesType
} from "../types";
import { ConfigManager } from "../services/config-manager";
import { joinPath, resolvePath } from "../utils";

export class DashboardConfig
  extends ConfigManager
  implements BaseOptions
{
  debug = false;
  env: Env = Env.Local;
  base = "/_hotbars";
  encoding = "utf-8" as BufferEncoding;
  extname = "hbs";
  root = "";
  source = ".";
  language: LanguageConfig = {
    enabled: false,
    languages: ["en"],
    default: "en",
  };
  data = "_data";
  helpers = "_helpers";
  lib = "_lib";
  layouts = "_layouts";
  partials = "_partials";
  precompile = "_precompile";
  shared = "_shared";
  views = "_views";
  controllers = "_controllers";
  styleMode: StylesType = "scss";
  styles = "_styles";
  scripts = "scripts";
  public = "_public";
  default_views = "_default_views";
  auth: AuthConfig = {
    enabled: true,
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
      signInRedirect: "_hotbars/_index",
      signUpRedirect: "_hotbars/_index",
      signIn: "_hotbars/_sign-in",
      signUp: "_hotbars/_sign-up",
      signUpPending: "_hotbars/_sign-up-pending",
      signOut: "_hotbars/_sign-out",
      passwordRecovery: "_hotbars/_password-recovery",
      passwordRecovered: "_hotbars/_password-recovered",
      passwordReset: "_hotbars/_password-reset",
    },
    session: {
      secret: "keyboard dog",
      saveUninitialized: false,
      resave: false,
      cookie: {
        secure: false,
        maxAge: 60 * 60 * 1000,
      },
    },
  };
  mailer: MailerConfig = {
    enabled: false,
    source: "_mail",
    data: "data",
    partials: "partials",
    layouts: "layouts",
    templates: "templates",
  };
  serverUrl = "";
  ignore: string[] = [];
  watch: string[] = [];

  protected static instance: Readonly<DashboardConfig>;

  private constructor(argv: CliOptions) {
    super();

    this.root = resolvePath(__dirname, "..", "..", "client");
    this.env = (argv.env as Env) || Env.Local;

    if (this.language.default) {
      this.set("currentLanguage", this.language.default);
    }

    ["data", "partials", "layouts", "templates"].forEach((name) =>
      _.set(
        this.mailer,
        name,
        joinPath(this.mailer.source, _.get(this.mailer, name))
      )
    );

    if (this.env === Env.Local) {
      this.watch = [
        this.fullGlobPath("controllers"),
        this.fullGlobPath("data"),
        this.fullGlobPath("helpers"),
        this.fullGlobPath("lib"),
        this.fullGlobPath("layouts"),
        this.fullGlobPath("partials"),
        this.fullGlobPath("shared"),
        this.fullGlobPath("views"),
        this.fullGlobPath("public"),
        this.fullGlobPath("default_views"),
        this.fullGlobPath("mailer.data"),
        this.fullGlobPath("mailer.partials"),
        this.fullGlobPath("mailer.layouts"),
        this.fullGlobPath("mailer.templates")
      ]
    }

    this.ignore = [this.fullPath("public", "bundles")];
  }

  static create(argv: CliOptions): Readonly<DashboardConfig> {
    this.instance = Object.freeze(new this(argv));
    return this.instance;
  }
}
