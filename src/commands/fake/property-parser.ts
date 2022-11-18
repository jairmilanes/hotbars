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
  Schema,
  SchemaConfig,
  UniqueCompareCallback,
} from "./types";
import { SafeAny } from "../../types";
import { afterEach } from "./post-generation";

// eslint-disable-next-line @typescript-eslint/no-var-requires
// const stringHelpers = require("handlebars-helpers/lib/string.js");
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

const parsePropConfig = (prop: string, record: Record<string, SafeAny>): FakerConfig => {
  const parts = prop.split(":");
  const result: FakerConfig = {
    method: "",
    args: []
  };

  if (parts[0] === "unique") {
    result.unique = faker.helpers.unique;
    parts.shift();
  }

  if (parts[0] === "hash") {
    result.hash = hashSync;
    parts.shift();
  }

  if (parts[0].indexOf('.') > -1) {
    const [module, helper] = parts[0].split('.')
    result.module = module;
    result.method = helper;
  } else {
    result.method = parts[0];
  }

  if (result.method === "use") {
    result.args = [coerce(parts[1])];
    return result;
  }

  if (parts[1].indexOf(",") > -1) {
    result.args = parts[1].split(',');
  } else {
    result.args = [parts[1]]
  }

  const parseProp = (value: string) => {
    if (value.indexOf('prop.')) {
      return record[value.split('.')[1]];
    }
    return coerce(value);
  }

  const parseObject = (arg: string) =>
    arg.split('+')
      .reduce<Record<string, string|number|boolean>>((props, arg) => {
        const [name, value] = arg.split('_');

        return {
          ...props,
          [name]: coerce(value)
        }
      }, {})

  const parseArray = (arg: string) => arg.split('+').map(parseProp)

  result.args = result.args.map((arg: string) => {
    if (arg.indexOf('+') > -1) {
      if (arg.indexOf('_') > -1) {
        // Argument is an object
        return parseObject(arg);
      } else {
        // Argument is an array
        return parseArray(arg);
      }
    }

    return parseProp(arg);
  })

  return result;
};

const getMethod = (config: FakerConfig): ((...args: any[]) => any) | undefined => {
  const {module, method} = config;
  if (_.has(faker, [module as string, method])
    && _.isFunction(_.has(faker, [module as string, method]))) {
    return _.get(faker, [module as string, method]);
  }

  if (_.has(_, method) && _.isFunction(_.get(_, method))) {
    return _.get(_, method);
  }
};

const parseUse = (params: FlowParams) => {
  const { prop, obj, config } = params;

  if (obj[prop] === undefined && config.method === "use") {
    obj[prop] = config.args[0];
    logger.debug(`-------- parsed:use: ${prop} => ${obj[prop]}`);
  }

  return params;
};

const parseElementArray = (params: FlowParams) => {
  const { prop, obj, config } = params;
  const { module, method, args } = config;

  if (obj[prop] === undefined && method === "arrayElement") {
    if (!compareCallbacks[prop]) {
      compareCallbacks[prop] = arrayElementUniqueCompare(args.length);
    }

    const options = { compare: compareCallbacks[prop] };
    const fn = getMethod(config);

    if (fn) {
      obj[prop] = config.unique ? config.unique(fn, [args], options) : fn(args);
      logger.debug(
        `-------- parsed:${module}.${method}: ${prop} => ${obj[prop]}`
      );
    }
  }

  return params;
};

const parseHelper = (params: FlowParams) => {
  const { prop, obj, config } = params;
  const { unique, hash, args} = config;

  const fn = getMethod(config);

  if (obj[prop] === undefined && fn) {
    if (unique) {
      const options = { compare: compareCallbacks[prop] };
      if (args.length > 1) {
        obj[prop] = unique(fn, [...args], options);
      } else {
        obj[prop] = unique(fn, [args[0]], options);
      }
      return;
    }

    if (hash) {
      const unhashedValue = fn(args);
      obj[`${prop}Unhashed`] = unhashedValue;
      obj[prop] = hash(unhashedValue, 10);
      return;
    }

    obj[prop] = fn(...args);

    logger.debug(`-------- parsed:${config.module}.${config.method}: ${prop} => ${obj[prop]}`);
  }

  return params;
};

export const parseProperty = (
  schema: Schema,
  obj: Record<string, SafeAny>,
  prop: string
) => {
  if (typeof schema[prop] !== "string") return;

  const config = parsePropConfig(schema[prop], obj);

  if (
    config.method.startsWith("relation") ||
    config.method.startsWith("join")
  ) {
    return;
  }

  logger.debug(`------ parsing:${prop}: ${config.method} -> ${config.args}`);

  flow([
    parseUse,
    parseElementArray,
    parseHelper,
  ])({ prop, obj, config });
};

export const generateRecords = (
  schemaConfig: SchemaConfig,
  size: number
): GeneratedEntry[] => {
  const { schema } = schemaConfig;
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
