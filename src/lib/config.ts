import projectRoot from "app-root-path";
import { cosmiconfigSync } from "cosmiconfig";
import { Browser, SafeObject } from "../types";
import { logger } from "./logger";
import { joinPath, resolvePath } from "../utils/path";

interface PrivateOptions {
  moduleName: string;
  root: string;
  watch: string[];
  serverViews: string;
  serverPartials: string;
  serverScripts: string;
  serverStyles: string;
}

interface UploadField {
  name: string;
  maxCount?: number;
}

interface UploadsConfig {
  enabled: boolean;
  path: string;
  limit: number;
  maxFileSize: number;
  types: string[] | UploadField[];
}

interface CorsConfig {
  enabled: boolean;
}

interface ConfigControls {
  cors: boolean | SafeObject;
  uploads: boolean | SafeObject;
}

interface Options {
  logLevel: number;
  encoding: BufferEncoding;
  protocol: "http" | "https";
  host: string;
  browser: Browser;
  port: number;
  socket_port: number;
  extname: string;
  source: string;
  configName: string;
  bootstrapName: string;
  routesConfigName: string;
  fakeDb?: string;
  data: string;
  helpers: string;
  layouts: string;
  partials: string;
  precompile: string;
  views: string;
  styleMode: "css" | "scss";
  styles: string;
  public: string;
  partialsOptions: any;
  ignore: string[];
  ignorePattern?: RegExp;
  uploads: UploadsConfig;
  cors: CorsConfig;
  env: string;
}

interface CliOptions {
  env: string;
  port: number;
  socketPort: number;
  configName: string;
  logLevel: number;
  browser: string;
}

export type Config = Options & PrivateOptions;

export const loadConfig = <T = SafeObject>(
  configName: string,
  moduleName: string
): T | undefined => {
  try {
    const explorer = cosmiconfigSync(moduleName, {
      searchPlaces: [
        `.${configName}`,
        `.${configName}.json`,
        `.${configName}.js`,
        `.${configName}.cjs`,
        `${configName}.json`,
        `${configName}.js`,
        `${configName}.cjs`,
      ],
      loaders: {
        [`.${moduleName}`]: () => null,
      },
      stopDir: projectRoot.toString(),
    });

    const result = explorer.search();

    if (result?.config) {
      return result.config;
    }
  } catch (error) {
    logger.error(error);
    logger.warn("User routes configuration not found, skipping.");
  }
};

export const parseConfig = (argv: CliOptions): Config => {
  const privateOptions: PrivateOptions = {
    moduleName: "hhr",
    root: process.cwd(),
    watch: [],
    serverViews: resolvePath(__dirname, "..", "./client/views"),
    serverPartials: resolvePath(__dirname, "..", "./client/partials"),
    serverScripts: resolvePath(__dirname, "..", "./client/scripts"),
    serverStyles: resolvePath(__dirname, "..", "./client/styles"),
  };

  const defaults: Options = {
    logLevel: argv.logLevel || 1,
    encoding: "utf-8",
    protocol: "http",
    host: "127.0.0.1",
    browser: argv.browser as Browser,
    port: argv.port || 3000,
    socket_port: argv.socketPort || 5001,
    extname: "hbs",
    source: "src",
    configName: argv.configName,
    bootstrapName: `${privateOptions.moduleName}`,
    routesConfigName: `routes.${privateOptions.moduleName}`,
    fakeDb: undefined,
    data: "data/**/*.{json,js,cjs}",
    helpers: "helpers/**/*.{js,cjs}",
    layouts: "layouts/**/*.{html,hbs,handlebars}",
    partials: "partials/**/*.{html,hbs,handlebars}",
    precompile: "precompile/**/*.{html,hbs,handlebars}",
    views: "views",
    styleMode: "css",
    styles: "styles",
    public: "public",
    partialsOptions: {},
    ignore: [],
    ignorePattern: undefined,
    uploads: {
      enabled: true,
      path: "uploads/",
      limit: 10,
      maxFileSize: 1048576,
      types: [],
    },
    cors: {
      enabled: true,
    },
    env: process.env?.NODE_ENV || "development",
  };

  const userConfig = loadConfig(defaults.configName, privateOptions.moduleName);

  const config: { [key: string]: any } = {
    ...defaults,
    ...userConfig,
    ...privateOptions,
  };

  config.views = joinPath(config.source, config.views);

  config.watch.concat([
    `${config.routesConfigName}.js`,
    `${config.routesConfigName}.cjs`,
  ]);

  config.watch.push(config.data);

  config.watch.push(`**/*.${config.extname}`);

  config.watch.push(`${config.styles}/**/*.${config.styleMode}`);

  if (config.styleMode === "scss") {
    config.watch.push(`${config.public}/**/*.css`);
  }

  ["data", "helpers", "partials", "layouts", "precompile"].forEach((target) => {
    config[target] = resolvePath(config.root, config.source, config[target]);
  });

  // Patch paths
  config.watch = config.watch.map((relativePath: string) => {
    return joinPath(config.source, relativePath);
  });

  if (config.ignorePattern) {
    config.ignorePattern = new RegExp(config.ignorePattern);
  }

  if (config.ignore) {
    config.ignore = config.ignore.map(function (relativePath: string) {
      return joinPath(config.root, relativePath);
    });
  }

  return config as Config;
};
