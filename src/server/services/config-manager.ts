import * as _ from "lodash";
import { OptionalFeature, SafeAny } from "../types";
import { joinPath, resolvePath } from "../utils";
import { Config } from "../core";

export abstract class ConfigManager {
  root = "";
  source = "";
  extname = "hbs";

  protected customProps: Record<string, any> = {};

  protected static instance: Readonly<ConfigManager>;

  static get<P>(key?: string) {
    return this.instance.get<P>(key);
  }

  static set(key: string, value: any): void {
    this.instance.set(key, value);
  }

  static value<T>(key: keyof Config): T {
    return this.instance.get<T>(key) as T;
  }

  static is(key: string, value: any): boolean {
    return this.instance.is(key, value);
  }

  static fullPath(name: string, ...args: string[]): string {
    return this.instance.fullPath(name, ...args);
  }

  static relPath(name: string, ...args: string[]): string {
    return this.instance.relPath(name, ...args);
  }

  static relGlobPath(name: string, ...args: string[]): string {
    return this.instance.relGlobPath(name, ...args);
  }

  static fullGlobPath(name: string, ...args: string[]): string {
    return this.instance.fullGlobPath(name, ...args);
  }

  static globPath(base: string, ext?: string): string {
    return this.instance.globPath(base, ext);
  }

  static enabled(name: string): boolean {
    const option = this.instance.get(name) as OptionalFeature;
    return option.enabled;
  }

  set(key: string, value: SafeAny): void {
    _.set(this.customProps, key, value);
  }

  get(): Readonly<ConfigManager>;
  get<P>(key?: string): P;
  get<P = SafeAny>(key?: string): P | Readonly<ConfigManager> | undefined {
    if (!key) return this;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (_.has(this, key)) {
      return _.get(this, key) as P;
    }

    if (_.has(this.customProps, key)) {
      return _.get(this.customProps, key) as P;
    }
  }

  is(key: string, value: any): boolean {
    return this.get(key) === value;
  }

  fullPath(name: string, ...args: string[]): string {
    const ext = this.getExtArg(args);
    return resolvePath(
      ...[this.root, this.source, this.get<string>(name), ...args]
    ).concat(ext || "");
  }

  relPath(name: string, ...args: string[]): string {
    const ext = this.getExtArg(args);
    return joinPath(...[this.source, this.get<string>(name), ...args]).concat(
      ext || ""
    );
  }

  relGlobPath(name: string, ...args: string[]) {
    const ext = this.getExtArg(args);
    return joinPath(
      this.relPath(name, ...args),
      this.getPatternByType(name, ext)
    );
  }

  fullGlobPath(name: string, ...args: string[]): string {
    const ext = this.getExtArg(args);

    return joinPath(
      this.fullPath(name, ...args),
      this.getPatternByType(name, ext)
    );
  }

  enabled(name: string): boolean {
    const option = this.get(name) as OptionalFeature;
    return "enabled" in option && option.enabled;
  }

  globPath(base: string, ext?: string): string {
    if (ext && ext.startsWith(".")) ext = ext.substring(1);

    if (ext) {
      return joinPath(base, this.getPatternByType("", ext));
    }

    return joinPath(base, this.getPatternByType("", this.extname));
  }

  private getPatternByType(type: string, ext?: string) {
    if (ext && ext.startsWith(".")) ext = ext.substring(1);

    const extensions = () => {
      switch (type) {
        case "jsonSchema":
          return "json";
        case "data":
        case "mailer.data":
          return "{json,js,cjs}";
        case "public":
        case "helpers":
        case "lib":
        case "controllers":
        case "auth":
          return "{js,cjs}";
        case "styles":
          return "{css,scss}";
        default:
          if (ext) return `${ext}`;
          return `${this.extname}`;
      }
    };

    return `/**/*.${extensions()}`;
  }

  private getExtArg(args: string[]): string | undefined {
    if (!args.length) return undefined;
    return args[args.length - 1].startsWith(".") ? args.pop() : undefined;
  }
}
