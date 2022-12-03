import * as _ from "lodash";
import {
  BaseOptions,
  CliOptions,
  Env,
  LanguageConfig,
  MailerConfig,
  StylesType,
} from "../types";
import { ConfigManager } from "../services/config-manager";
import { joinPath, resolvePath } from "../utils";

export class DashboardConfig
  extends ConfigManager<BaseOptions>
  implements BaseOptions
{
  dev = false;
  env: Env = Env.Dev;
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
    this.env = (argv.env as Env) || Env.Dev;
    this.dev = argv.dev || false;

    if (this.language.default) {
      this.set("currentLanguage", this.language.default);
    }

    /* this.ignore.push(
      this.fullGlobPath("public", "bundles", ".js")
    ); */

    if (this.env !== Env.Prod) {
      this.watch.push(this.fullGlobPath("data"));
      this.watch.push(this.fullGlobPath("helpers"));
      this.watch.push(this.fullGlobPath("layouts"));
      this.watch.push(this.fullGlobPath("partials"));
      this.watch.push(this.fullGlobPath("shared"));
      this.watch.push(this.fullGlobPath("views"));
      this.watch.push(this.fullGlobPath("public"));
    }

    ["data", "partials", "layouts", "templates"].forEach((name) =>
      _.set(
        this.mailer,
        name,
        joinPath(this.mailer.source, _.get(this.mailer, name))
      )
    );
  }

  static create(argv: CliOptions): Readonly<DashboardConfig> {
    this.instance = Object.freeze(new this(argv));
    return this.instance;
  }
}
