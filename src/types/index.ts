/* eslint-disable @typescript-eslint/no-explicit-any */
import { Router } from "express-ws";
import { Socket } from "node:net";
import { HelperDeclareSpec, HelperDelegate } from "handlebars";
import { NextFunction, Request, Response } from "express";
import { ControllerAbstract } from "../abstract";
import { Config } from "../lib/core";

export type SafeAny =
  | string
  | number
  | boolean
  | string[]
  | number[]
  | boolean[]
  | RegExp
  | SafeObject
  | SafeArray
  | null
  | undefined;

export interface SafeObject {
  [key: string | number]: SafeAny;
}

export type SafeArray = SafeObject[] | SafeAny[];

export type AnymatchFn = (testString: string) => boolean;

export type AnymatchPattern = string | RegExp | AnymatchFn;

export interface UploadField {
  name: string;
  maxCount?: number;
}

export interface OptionalFeature {
  enabled: boolean;
}

export interface UploadsConfig extends OptionalFeature {
  path: string;
  limit: number;
  maxFileSize: number;
  types: string[] | UploadField[];
}

export interface CorsConfig extends OptionalFeature {
  enabled: boolean;
}

export interface AuthConfig extends OptionalFeature {
  path: string;
  securePath: string;
  usersTable: string;
  usernameColumn: string;
  passwordColumn: string;
}

export interface AutoRouteConfig {
  methods: string | string[];
  [view: string]: string | string[];
}

export type HTTPProtocol = "http" | "https";

export type StylesType = "css" | "scss";

export interface PrivateOptions {
  root: string;
  watch: string[];
  serverViews: string;
  serverPartials: string;
  serverScripts: string;
  serverStyles: string;
}

export interface CliOptions {
  env: string;
  port: number;
  socketPort: number;
  configName: string;
  logLevel: number;
  logFilePath: string;
  browser: Browser | null;
}

export interface Options extends CliOptions, PrivateOptions {
  encoding: BufferEncoding;
  protocol: HTTPProtocol;
  host: string;
  extname: string;
  source: string;
  bootstrapName: string;
  routesConfigName: string;
  jsonDb?: string;
  dbSchema?: string;
  data: string;
  helpers: string;
  layouts: string;
  partials: string;
  precompile: string;
  shared: string;
  views: string;
  controllers: string;
  styleMode: StylesType;
  styles: string;
  public: string;
  partialsOptions: any;
  ignore: string[];
  ignorePattern?: RegExp;
  uploads: UploadsConfig;
  cors: CorsConfig;
  auth?: AuthConfig;
  dev: boolean;
  serverUrl: string;
  autoroute: AutoRouteConfig;
  [key: string]: any;
}

export interface TrackedSocket extends Socket {
  _id: string;
  _idle: boolean;
}

export interface ServerError extends Error {
  code: string;
}

export interface HandlebarsFile {
  path: string;
  base: string;
}

export interface HandlebarsWaxConfig {
  handlebars: typeof Handlebars;
  bustCache: boolean;
  cwd: string;
  compileOptions: SafeObject;
  extensions: string[];
  templateOptions: SafeObject;
  parsePartialName: (options: SafeObject, file: HandlebarsFile) => string;
  parseHelperName: (options: SafeObject, file: HandlebarsFile) => string;
  parseDecoratorName: (options: SafeObject, file: HandlebarsFile) => string;
  parseDataName: (options: SafeObject, file: HandlebarsFile) => string;
}

export type HandlebarsEngineCallback = (error: Error, compiled: string) => void;

export interface HandlebarsWax {
  handlebars: typeof Handlebars;
  config: HandlebarsWaxConfig;
  context: SafeObject;
  partials(partials: string): this;
  partials(spec: { [name: string]: HandlebarsTemplateDelegate }): this;
  helpers(pattern: string): this;
  helpers(spec: HelperDeclareSpec): this;
  helpers(delegate: HelperDelegate): this;
  data(pattern: string): this;
  data(spec: SafeObject): this;
  engine(
    file: string,
    data: SafeObject,
    callback: HandlebarsEngineCallback
  ): this;
  compile<T = SafeObject>(
    template: string,
    options?: CompileOptions
  ): HandlebarsTemplateDelegate<T>;
}

export interface HandlebarsConfigureResponse {
  instance?: HandlebarsWax;
  error?: Error;
}

export enum Browser {
  Chrome = "chrome",
  Firefox = "firefox",
  Edge = "msedge",
}

export type UserRoutesCallback = (router: Router) => void;

export type UserBootstrapCallback = (
  config: Readonly<Config>
) => Promise<SafeObject>;

export type ControllerFunction = (
  req: Request,
  res: Response
) => Promise<SafeObject>;

export type UserControllers = {
  [path: string]: ControllerAbstract | ControllerFunction;
};

export enum WatcherChangeType {
  Routes = "routes",
  Controller = "controller",
  Page = "page",
  Script = "script",
  Scss = "scss",
  Css = "css",
  File = "file",
}

export enum WatcherEvent {
  Change = "change",
  Add = "add",
  AddDir = "addDir",
  Unlink = "unlink",
  UnlinkDir = "unlinkDir",
  Ready = "ready",
  Error = "error",
  All = "all",
  Broadcast = "broadcast",
}

export type WatcherEventCallback = (
  event: WatcherEvent,
  change: WatcherChange
) => void;

export type WatcherListeners = {
  [eventName: string]: Array<WatcherEventCallback>;
};

export interface WatcherChange {
  type: WatcherChangeType;
  path: string;
  structural: boolean;
}

export interface InjectionData {
  regex: string[];
  tag: string;
}

export type AllowedRouteMethods =
  | "get"
  | "post"
  | "put"
  | "patch"
  | "delete"
  | "use";

export type ExpressMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => void | Promise<void>;

export interface TrackedRoute {
  method: AllowedRouteMethods;
  path: string;
}

export interface RequestError extends Error {
  view?: {
    name: string;
  };
}

export interface RouteKey {
  name: string;
  optional: boolean;
  offset: number;
}

export type RequestMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

export interface Route {
  name?: string;
  path: string;
  stack?: RouteLayer[];
  method: RequestMethod;
  methods: {
    [key: string]: boolean;
  };
}

export interface RouteHandle {
  stack: RouteLayer[];
}

export interface RouteLayer {
  name: string;
  keys?: RouteKey[];
  route?: Route;
  regexp: RegExp;
  handle?: RouteHandle;
}

export interface RouteMap {
  index: number;
  type: string;
  path: string;
  slug: string;
  source?: string;
  prefix?: string;
  method?: RequestMethod;
  methods?: RequestMethod[];
  description?: string;
  params?: RouteKey[];
  routes?: RouteMap[];
}

export interface RouterMap {
  [name: string]: RouteMap[];
}

export interface User extends Record<string , any>{
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  password: string;
  avatar: string;
  timeZone: string;
}

export interface AuthenticateCallbackOptions {
  message: string;
}

export type AuthenticateCallback = (
  error?: Error,
  user?: User | false,
  options?: AuthenticateCallbackOptions
) => void;
