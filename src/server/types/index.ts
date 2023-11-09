/* eslint-disable @typescript-eslint/no-explicit-any */
import { Router } from "express-ws";
import { Socket } from "node:net";
import Handlebars, { HelperDeclareSpec, HelperDelegate } from "handlebars";
import { NextFunction, Request, Response } from "express";
import { ControllerAbstract } from "../controllers";
import { CorsOptions } from "cors";
import { SessionOptions } from "express-session";
import { ParamsDictionary } from "express-serve-static-core";
import { ParsedQs } from "qs";

export enum Env {
  Prod = "production",
  Dev = "development",
  Test = "test",
}

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

export type JsonDb = Record<string, Record<string, any>[]>;

export interface RequestEnhanced extends Request {
  original: {
    params: ParamsDictionary;
    query: ParsedQs;
  };
}

export interface EnhancedJsonDbPayload {
  items: Record<string, any>[];
  total: number;
  pages: number;
  page: number;
  next: number | null;
  prev: number | null;
  from: number | null;
  to: number | null;
}

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

export interface JsonServerConfig extends OptionalFeature {
  enabled: boolean;
}

export interface CorsConfig extends OptionalFeature, CorsOptions {
  enabled: boolean;
  whitelist?: string[];
}

export type AuthReCaptcha = "v2" | "v3" | false;

export interface AuthConfig extends OptionalFeature {
  path: string;
  https?: boolean;
  securePath: string;
  usersTable: string;
  usernameColumn: string;
  emailColumn: string;
  passwordColumn: string;
  confirmEmail: boolean;
  reCaptcha: AuthReCaptcha;
  rememberMe?: number;
  terms?: string;
  views: {
    signInRedirect: string;
    signUpRedirect: string;
    signIn: string;
    signUp: string;
    signUpPending: string;
    signOut: string;
    passwordRecovery: string;
    passwordRecovered: string;
    passwordReset: string;
  };
  session: SessionOptions;
}

export type AuthDoneCallback<T> = (
  error?: Error | null,
  data?: string | boolean | User | null,
  info?: T
) => void;

export interface LanguageConfig extends OptionalFeature {
  languages: string[];
  default: string;
}

export interface SMTPConfig {
  port: number;
  host: string;
  from: string;
  username: string;
  password: string;
}

export interface MailerConfig extends OptionalFeature {
  smtp?: SMTPConfig;
  source: string;
  data: string;
  partials: string;
  layouts: string;
  templates: string;
}

export interface SMTPServerCredentials {
  username: string;
  password: string;
}

export interface SMTPServerConfig extends OptionalFeature {
  port: number;
  host: string;
  whitelist: string[];
  keepHeaders: boolean;
  emailsLimit: number;
  maxMessageSize: number;
  auth: SMTPServerCredentials;
}

export interface AutoRouteConfig {
  methods: string | string[];
  [view: string]: string | string[];
}

export type HTTPProtocol = "http" | "https";

export type StylesType = "css" | "scss";

export interface PrivateOptions {
  watch: string[];
}

export interface CliOptions {
  dev?: boolean;
  env?: string;
  port?: number;
  source?: string;
  jsonSchema?: string;
  jsonDb?: string;
  socketPort?: number;
  configName?: string;
  logLevel?: number;
  verbose?: boolean;
  root?: string;
}

export interface BaseOptions extends PrivateOptions {
  env: string;
  language: LanguageConfig;
  extname: string;
  source: string;
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
  scripts: string;
  public: string;
  mailer: MailerConfig;
  ignore: string[];
  ignorePattern?: RegExp;
  dev: boolean;
  serverUrl: string;
}

export interface Options extends BaseOptions {
  configName: string;
  socketPort: number;
  logLevel: number;
  logToFile: boolean;
  verbose: boolean;
  browser?: Browser;
  encoding: BufferEncoding;
  activeData: boolean;
  protocol: HTTPProtocol;
  host: string;
  bootstrapName: string;
  routesConfigName: string;
  jsonSchema: string;
  jsonDb?: string;
  partialsOptions: any;
  jsonServer?: JsonServerConfig;
  smtpServer: SMTPServerConfig;
  uploads: UploadsConfig;
  cors: CorsConfig;
  auth?: AuthConfig;
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
  handlebars?: typeof Handlebars;
  error?: Error;
}

export enum Browser {
  Chrome = "chrome",
  Firefox = "firefox",
  Edge = "msedge",
  Safari = "safari",
}

export type UserRoutesCallback = (router: Router) => void;

export type UserBootstrapCallback = (
  config: Readonly<Options>
) => Promise<SafeObject>;

export type ControllerFunction = (
  req: Request,
  res: Response
) => Promise<SafeObject>;

export type UserControllers = {
  [path: string]: ControllerAbstract | ControllerFunction;
};

export enum WatcherChangeType {
  Auth = "auth",
  Routes = "routes",
  Controller = "controller",
  PreCompiled = "precompiled",
  UserRuntime = "userRuntime",
  DashboardRuntime = "dashboardRuntime",
  Email = "email",
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

export interface NewUser extends Record<string, any> {
  username: string;
  email: string;
  password: string;
}

export interface User extends NewUser {
  id: string;
  confirmed?: boolean;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  timeZone?: string;
}

export interface AuthenticateCallbackOptions {
  message: string;
}

export type AuthenticateCallback = (
  error?: Error,
  user?: User | false,
  options?: AuthenticateCallbackOptions
) => void;

export interface ActionResponse<T = Error, D = Record<string, any>> {
  data?: D;
  error?: T | null;
  [key: string]: any;
}
