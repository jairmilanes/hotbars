/* eslint-disable @typescript-eslint/no-explicit-any */
import * as _ from "lodash";
import { faker } from "@faker-js/faker/locale/pt_BR";
import { RecordKey } from "@faker-js/faker/modules/helpers/unique";
import flow from "lodash/flow";
import { hashSync } from "bcryptjs";
import { logger } from "../../lib/services";
import {
  CompareCallbacks,
  FakerConfig,
  FlowParams,
  GeneratedEntry,
  Schema, SchemaConfig,
  UniqueCompareCallback
} from "./types";
import { SafeAny, SafeObject } from "../../types";
import { afterEach } from "./post-generation";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const stringHelpers = require("handlebars-helpers/lib/string.js");
let compareCallbacks: CompareCallbacks = {};

const arrayElementUniqueCompare = (maxTries: number): UniqueCompareCallback => {
  let rotation: RecordKey[] = [];
  return (store: Record<RecordKey, RecordKey>, key: RecordKey): 0 | -1 => {
    if (rotation.indexOf(key) === -1) {
      rotation.push(key);
      return -1;
    }

    if (rotation.length === maxTries) {
      rotation = [key];
      return -1;
    }

    return 0;
  };
};

const isArgMap = (args: string | string[]) => {
  if (typeof args === "string") {
    return args.match(/^.*_.*,.*$/g);
  }
  return args.join(",").match(/^.*_.*,.*$/g);
};

const coerce = (arg: string): any => {
  const trimmed = arg.trim();

  if (_.isNil(trimmed)) return;

  if (_.isEmpty(trimmed)) return;

  if (!isNaN(parseInt(trimmed, 10)) && _.isString(trimmed)) {
    if (trimmed.indexOf(".") > -1 || trimmed.indexOf(",") > -1) {
      return parseFloat(trimmed);
    }

    return parseInt(trimmed, 10);
  }

  if (trimmed === "true" || arg === "false") {
    return trimmed === "true";
  }

  return trimmed;
};

const coerceArgsMap = (args: string[]): SafeObject => {
  return args.reduce<SafeObject>((valid, arg: string) => {
    const [key, value] = arg.split("_");
    const coerced = coerce(value);

    if (coerced) {
      valid[key] = coerced;
    }

    return valid;
  }, {});
};

const coerceArgsArray = (args: string[]): any[] => {
  return args.reduce((valid: any[], arg: string) => {
    const coerced = coerce(arg);
    if (coerced) valid.push(coerced);
    return valid;
  }, []);
};

const coerceArgs = <T = any[] | SafeObject | undefined>(
  args: string | string[]
): T => {
  if (typeof args === "string") args = args.split(",");

  args = args.filter((arg) => arg.trim().length > 0);

  if (!args.length) return undefined as T;

  if (isArgMap(args)) {
    return coerceArgsMap(args) as T;
  }

  return coerceArgsArray(args) as T;
};

const parsePropConfig = (prop: string): FakerConfig => {
  const parts = prop.split(":");
  const result: FakerConfig = { method: "" };

  if (parts[0] === "unique") {
    result.unique = faker.helpers.unique;
    parts.shift();
  }

  if (parts[0] === "hash") {
    result.hash = hashSync;
    parts.shift();
  }

  result.method = parts[0];
  result.args = parts[1] || "";

  return result;
};

const getMethod = (module: string, methodName: string) => {
  return (faker as any)[module][methodName];
};

const call = (module: string, methodName: string, args: any[]) => {
  const fn = getMethod(module, methodName);
  if (fn) {
    logger.debug(`-------- calling:${module}.${methodName}(${args.join(",")})`);
    return fn(...args);
  }
  logger.warn(`-------- not found:${module}.${methodName}`);
};

const parseUse = (params: FlowParams) => {
  const { prop, obj, config } = params;

  if (obj[prop] === undefined && config.method.startsWith("use")) {
    obj[prop] = config.args;
    logger.debug(`-------- parsed:use: ${prop} => ${obj[prop]}`);
  }

  return params;
};

const parseFakerHelper = (params: FlowParams) => {
  const { prop, obj, config } = params;

  if (
    obj[prop] === undefined &&
    config.args?.startsWith("prop.") &&
    config.method.startsWith("helpers.")
  ) {
    const helper = config.method.split(".")[1];
    const propName = config.args.split(".")[1];

    obj[prop] = call("helpers", helper, [obj[propName]]);
    logger.debug(`-------- parsed:helpers.${helper}: ${prop} => ${obj[prop]}`);
  }

  return params;
};

const parseStringHelper = (params: FlowParams) => {
  const { prop, obj, config } = params;
  const helper = config.method.split(".")[1];

  if (
    obj[prop] === undefined &&
    config.args?.startsWith("prop.") &&
    helper in stringHelpers
  ) {
    const propName = config.args.split(".")[1];
    obj[prop] = stringHelpers[helper](obj[propName]);
    logger.debug(`-------- parsed:string.${helper}: ${prop} => ${obj[prop]}`);
  }

  return params;
};

const parseLodashHelpers = (params: FlowParams) => {
  const { prop, obj, config } = params;

  if (
    obj[prop] === undefined &&
    config.method.startsWith("lodash") &&
    config.args
  ) {
    const helper = config.method.split(".")[1];
    const args = config.args.split(" ");

    const realArgs = args.reduce<SafeAny[]>((ags, arg) => {
      if (arg.indexOf(",") > -1) {
        const parts = arg.split(",");

        const translated = parts.reduce<SafeAny[]>((pts, part) => {
          if (part.startsWith("prop.")) {
            const propName = part.split(".")[1];

            if (obj[propName]) {
              return [...pts, obj[propName]];
            }
          }

          return pts;
        }, []);

        return [...ags, translated];
      }

      if (arg.startsWith("prop.")) {
        const propName = arg.split(".")[1];

        if (obj[propName]) {
          return [...ags, obj[propName]];
        }
      }

      return [...ags, arg];
    }, []) as string[];

    if (helper in _) {
      obj[prop] = (_ as any)[helper](...realArgs);
    }
  }

  return params;
};

const parseDependentHelper = (params: FlowParams) => {
  const { prop, obj, config } = params;

  if (obj[prop] === undefined && config.args?.startsWith("prop.")) {
    const [module, helper] = config.method.split(".");
    const args = config.args.split(".");
    logger.debug("CODEPENDEND", config.method, module, helper);
    obj[prop] = call(module, helper, [obj[args[1]]]);
    logger.debug(
      `-------- parsed:coDependent.${module}.${helper}: ${prop} => ${obj[prop]}`
    );
  }

  return params;
};

const parseElementArrayHelper = (params: FlowParams) => {
  const { prop, obj, config } = params;
  const [module, helper] = config.method.split(".");

  if (obj[prop] === undefined && helper === "arrayElement") {
    const args = coerceArgs<any[]>(config.args?.split(",") || []);

    if (!compareCallbacks[prop]) {
      compareCallbacks[prop] = arrayElementUniqueCompare(args.length);
    }

    const options = { compare: compareCallbacks[prop] };
    const fn = getMethod(module, helper);

    obj[prop] = config.unique ? config.unique(fn, [args], options) : fn(args);
    logger.debug(
      `-------- parsed:${module}.${helper}: ${prop} => ${obj[prop]}`
    );
  }

  return params;
};

const parseHelper = (params: FlowParams) => {
  const { prop, obj, config } = params;
  if (obj[prop] === undefined) {
    const [module, helper] = config.method.split(".");
    const args = coerceArgs(config.args as string);
    const fn = getMethod(module, helper);

    if (config.unique) {
      const options = { compare: compareCallbacks[prop] };
      if (Array.isArray(args)) {
        obj[prop] = config.unique(fn, [...args], options);
      } else {
        obj[prop] = config.unique(fn, [args], options);
      }
    } else if (config.hash) {
      const unhashedValue = fn(args);
      obj[`${prop}Unhashed`] = unhashedValue;
      obj[prop] = config.hash(unhashedValue, 10);
    } else {
      if (Array.isArray(args)) {
        obj[prop] = fn(...args);
      } else {
        obj[prop] = fn(args);
      }
    }

    logger.debug(
      `-------- parsed:${module}.${helper}: ${prop} => ${obj[prop]}`
    );
  }

  return params;
};

const parseProperty = (
  schema: Schema,
  obj: Record<string, SafeAny>,
  prop: string
) => {
  if (typeof schema[prop] !== "string") return;

  const config = parsePropConfig(schema[prop]);

  if (
    config.method.startsWith("relation") ||
    config.method.startsWith("join")
  ) {
    return;
  }

  logger.debug(`------ parsing:${prop}: ${config.method} -> ${config.args}`);

  flow([
    parseUse,
    parseFakerHelper,
    parseStringHelper,
    parseLodashHelpers,
    parseDependentHelper,
    parseElementArrayHelper,
    parseHelper,
  ])({ prop, obj, config });
};

export const generateRecords = (
  schemaConfig: SchemaConfig,
  size: number
): GeneratedEntry[] => {
  const { schema } = schemaConfig
  compareCallbacks = {};
  const props = Object.keys(schema);

  logger.info(`-- parsing: ${schema.name}`);
  logger.debug("---- props %o", props.join(", "));

  const entries: GeneratedEntry[] = [];

  for (let i = 0; i < size; i++) {
    logger.debug(`---- ${i}...`);
    const entry: GeneratedEntry = {};

    props.forEach((prop) => parseProperty(schema, entry, prop));

    entries.push(afterEach(entry, schemaConfig));
  }

  logger.info(`-- generated ${entries} ${schema.name} records.`);

  return entries;
};
