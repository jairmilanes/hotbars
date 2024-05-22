import * as _ from "lodash";
import {
  AuthConfig,
  BaseOptions, CacheConfig,
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
  dev = false;
  base = "/_hotbars";
  encoding = "utf-8" as BufferEncoding;
  extname = "hbs";
  root = "";
  source = ".";
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
  app = "_app";
  data = "_server/_data";
  helpers = "_server/_helpers";
  controllers = "_server/_controllers";
  layouts = "_server/_layouts";
  default_views = "_server/_default_views";
  lib = "_server/_lib";
  partials = "_server/_partials";
  shared = "_server/_components";
  precompile = "_precompile";
  views = "_views";
  styleMode: StylesType = "scss";
  styles = "_styles";
  scripts = "scripts";
  public = "_public";
  cache: CacheConfig = {
    enabled: true,
    type: "file",
    expire: 8600
  };
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
      signInRedirect: "_hotbars/",
      signUpRedirect: "_hotbars/",
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
    this.dev = argv.dev || false;

    _.set(
      this.customProps,
      "currentLanguage",
      this.language.default
    );

    ["data", "partials", "layouts", "templates"].forEach((name) =>
      _.set(
        this.mailer,
        name,
        joinPath(this.mailer.source, _.get(this.mailer, name))
      )
    );

    if (this.dev) {
      this.watch = [
        this.fullGlobPath("controllers"),
        this.fullGlobPath("data"),
        this.fullGlobPath("helpers"),
        this.fullGlobPath("lib"),
        this.fullGlobPath("layouts"),
        this.fullGlobPath("partials"),
        this.fullGlobPath("shared"),
        this.fullGlobPath("precompile"),
        this.fullGlobPath("views"),
        this.fullGlobPath("public"),
        this.fullGlobPath("default_views"),
        this.fullGlobPath("mailer.data"),
        this.fullGlobPath("mailer.partials"),
        this.fullGlobPath("mailer.layouts"),
        this.fullGlobPath("mailer.templates")
      ]
    }

    this.ignore = [
      this.fullPath("public", "bundles")
    ];
  }

  static create(argv: CliOptions): Readonly<DashboardConfig> {
    this.instance = Object.freeze(new this(argv));
    return this.instance;
  }
}
