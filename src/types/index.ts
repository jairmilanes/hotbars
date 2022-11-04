import { Application } from "express-ws";
import { Config } from "../lib/config";
import { Socket } from "node:net";
import { HelperDeclareSpec, HelperDelegate } from "handlebars";
import express, { NextFunction, Request, Response } from "express";

export type SafeAny =
  | string
  | number
  | boolean
  | string[]
  | number[]
  | boolean[]
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

export type UserRoutesCallback = (
  add: Application,
  router: typeof express.Router,
  config: Config
) => void;

export type UserBootstrapCallback = (
  config: Config
) => SafeObject;

export enum WatcherChangeType {
  Routes = "routes",
  Page = "page",
  Script = "script",
  Scss = "scss",
  css = "css",
  File = "file",
}

export enum WatcherEventType {
  Change = "change",
  Add = "add",
  AddDir = "addDir",
  Unlink = "unlink",
  UnlinkDir = "unlinkDir",
  Ready = "ready",
  Error = "error",
  All = "all"
}

export type WatcherEventCallback = (event: WatcherEventType, change: WatcherChange) => void;

export type WatcherListeners = {
  [eventName: string]: Array<WatcherEventCallback>;
};

export interface WatcherChange {
  type: WatcherChangeType;
  path: string;
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

export interface RouteLayer {
  name: string;
  keys?: RouteKey[];
  route?: {
    name?: string;
    path: string;
    stack?: RouteLayer[];
    method: RequestMethod;
    methods: {
      [key: string]: boolean;
    };
  };
  regexp: RegExp;
  handle?: {
    stack: RouteLayer[];
  };
}

export interface RouteMap {
  name: string;
  path: string;
  slug: string;
  method: RequestMethod;
  description: string;
  params?: RouteKey[];
}

export interface RouterMap {
  [name: string]: RouteMap[];
}
