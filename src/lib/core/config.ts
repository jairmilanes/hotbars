import get from "lodash/get";
import set from "lodash/set";
import {
  Browser,
  CliOptions,
  HTTPProtocol,
  OptionalFeature,
  Options,
  PrivateOptions,
  SafeAny,
  SafeObject,
  StylesType,
} from "../../types";
import { loadFile, joinPath, resolvePath } from "../utils";
import { logger } from "../services";

const moduleName = "hotbars";

export const cliDefaults: CliOptions = {
  env: "development",
  port: 3000,
  browser: Browser.Edge,
  logLevel: 1,
  configName: `${moduleName}rc`,
  socketPort: 5001,
  logFilePath: "./logs/log.txt",
};

export class Config implements Options, PrivateOptions, CliOptions {
  logLevel = 1;
  logFilePath = "./logs/log.txt";
  encoding = "utf-8" as BufferEncoding;
  protocol = "http" as HTTPProtocol;
  host = "127.0.0.1";
  browser = Browser.Chrome;
  port = 3000;
  socketPort = 5001;
  extname = "hbs";
  source = "src";
  configName = `${moduleName}rc`;
  bootstrapName = `${moduleName}.bootstrap`;
  routesConfigName = `${moduleName}.routes`;
  jsonDb = undefined;
  dbSchema = "schema";
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
  uploads = {
    enabled: true,
    path: "uploads/",
    limit: 10,
    maxFileSize: 1048576,
    types: [],
  };
  cors = {
    enabled: true,
  };
  auth: undefined;
  env = "development";
  dev = false;
  serverUrl = "";
  ignorePattern?: RegExp;
  root = process.cwd();
  autoroute = {
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
  watch: string[] = [];

  private customProps: SafeObject = {};

  private static instance: Readonly<Config> = Object.freeze(
    new this(cliDefaults)
  );

  private constructor(argv: CliOptions) {
    const userConfig = loadFile<Partial<Options>>(this.configName, true);

    if (!userConfig) {
      logger.warn("User routes configuration not found, skipping.");
    }

    this.merge({
      ...argv,
      ...userConfig,
    });

    if (this.env === "development") {
      this.watch = [
        `${this.relPath("routesConfigName", "js")}`,
        `${this.relPath("routesConfigName", "cjs")}`,
        `${this.relGlobPath("data")}`,
        `${this.relGlobPath("helpers")}`,
        `${this.relGlobPath("layouts")}`,
        `${this.relGlobPath("partials")}`,
        `${this.relGlobPath("shared")}`,
        `${this.relGlobPath("views")}`,
        `${this.relGlobPath("controllers")}`,
        `${this.relGlobPath("styles")}`,
        `${this.relPath("public", `/${this.styles}/**/*.css`)}`,
      ];
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
    return "enabled" in option && option.enabled;
  }

  set(key: string, value: SafeAny): void {
    set(this.customProps, key, value);
  }

  get<T = SafeAny>(key: string): T {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return (get(this, key) as T) || (get(this.customProps, key) as T);
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
    const option = this[name as keyof this] as OptionalFeature;
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

  private merge(options: Partial<Options & PrivateOptions & CliOptions>): void {
    Object.keys(options).forEach((key) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this[key as keyof this] = options[key];
    });
  }
}
