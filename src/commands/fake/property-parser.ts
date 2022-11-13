import isNil from "lodash/isNil";
import isNaN from "lodash/isNaN";
import isString from "lodash/isString";
import isEmpty from "lodash/isEmpty";
import { faker } from "@faker-js/faker/locale/pt_BR";
import { RecordKey } from "@faker-js/faker/modules/helpers/unique";
import { logger } from "../../lib/services";
import {
  CompareCallbacks,
  FakerConfig,
  FlowParams,
  GeneratedEntry,
  Schema,
  UniqueCompareCallback,
} from "./types";
import { SafeAny } from "../../types";
import flow from "lodash/flow";

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

const coerceArgs = (args: any[]): any[] => {
  if (!args.length) return [];

  return args.reduce((valid: any[], arg: string) => {
    const trimmed = arg.trim();

    if (isNil(trimmed)) return valid;

    if (isEmpty(trimmed)) return valid;

    if (!isNaN(parseInt(trimmed, 10)) && isString(trimmed)) {
      if (trimmed.indexOf(".") > -1 || trimmed.indexOf(",") > -1) {
        valid.push(parseFloat(trimmed));
      } else {
        valid.push(parseInt(trimmed, 10));
      }

      return valid;
    }

    if (trimmed === "true" || arg === "false") {
      valid.push(trimmed === "true");
      return valid;
    }

    valid.push(trimmed);
    return valid;
  }, []);
};

const parsePropConfig = (prop: string): FakerConfig => {
  const parts = prop.split(":");
  const result: FakerConfig = { method: "" };

  if (parts[0] === "unique") {
    result.unique = faker.helpers.unique;
    parts.shift();
  }

  return { method: parts[0], args: parts[1] || "" };
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
    const args = coerceArgs(config.args?.split(",") || []);

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
    const args = coerceArgs(config.args?.split(",") || []);
    const options = { compare: compareCallbacks[prop] };
    const fn = getMethod(module, helper);

    obj[prop] = config.unique
      ? config.unique(fn, [args], options)
      : fn(...args);
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
    parseDependentHelper,
    parseElementArrayHelper,
    parseHelper,
  ])({ prop, obj, config });
};

export const generateRecords = (
  schema: Schema,
  size: number
): GeneratedEntry[] => {
  compareCallbacks = {};
  const props = Object.keys(schema);

  logger.info(`-- parsing: ${schema.name}`);
  logger.debug("---- props %o", props.join(", "));

  const entries: GeneratedEntry[] = [];

  for (let i = 0; i < size; i++) {
    logger.debug(`---- ${i}...`);
    const entry: GeneratedEntry = {};

    props.forEach((prop) => parseProperty(schema, entry, prop));

    entries.push(entry);
  }

  logger.info(`-- generated ${entries} ${schema.name} records.`);

  return entries;
};
