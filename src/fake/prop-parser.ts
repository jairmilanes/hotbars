import { faker } from "@faker-js/faker/locale/pt_BR";
import { hashSync } from "bcryptjs";
import * as _ from "lodash";
import { PropConfig, PropsConfig, SchemaConfig } from "./types";
import { split } from "../utils";

const coerce = (arg: string): any => {
  const trimmed = arg.trim();

  if (_.isNil(trimmed)) return;

  if (_.isEmpty(trimmed)) return;

  if (!isNaN(parseInt(trimmed, 10))) {
    if (_.indexOf(trimmed, ".") > -1 || _.indexOf(trimmed, ",") > -1) {
      return parseFloat(trimmed);
    }

    return parseInt(trimmed, 10);
  }

  if (trimmed === "true" || arg === "false") {
    return trimmed === "true";
  }

  return trimmed;
};

const parseProp = (value: string) => {
  // vaue is a reference
  if (_.indexOf(value, "prop.") > -1) {
    return value;
  }

  // value is a range
  if (_.indexOf(value, "..") > -1) {
    const nums: number[] = _.map(split(value, ".."), coerce);
    return _.random(nums[0], nums[1]);
  }

  return coerce(value);
};

const parseObject = (arg: string) =>
  _.split(arg, "+").reduce<Record<string, string | number | boolean>>(
    (props, arg) => {
      const [name, value] = split(arg, "_");

      return {
        ...props,
        [name]: coerce(value),
      };
    },
    {}
  );

const parseArray = (arg: string) => split(arg, "+").map(parseProp);

const parseArgs = (args: string[]): any[] => {
  return _.map(args, (arg: string) => {
    if (_.indexOf(arg, "+") > -1) {
      if (_.indexOf(arg, "_") > -1) {
        // Argument is an object
        return parseObject(arg);
      }

      // Argument is an array
      return parseArray(arg);
    }

    return parseProp(arg);
  });
};

export const parsePropConfig = (name: string, value: string): PropConfig => {
  const parts = split(value, ":");
  const result: PropConfig = {
    prop: name,
    method: "",
    args: [],
  };

  if (parts[0] === "unique") {
    result.unique = faker.helpers.unique;
    parts.shift();
  }

  if (parts[0] === "hash") {
    result.hash = hashSync;
    parts.shift();
  }

  if (parts[0] === "one-to-one" || parts[0] === "one-to-many") {
    result.module = parts[0];
    result.valid = true;
    result.args = split(parts[1], ",");

    const targets = split(result.args.shift(), "-");

    result.args = _.map(result.args, (arg) => arg.replace(/^.*\./, ""));

    if (targets[0]) {
      if (parts[0] === "one-to-one") {
        result.relation = {
          source: targets[1] ? targets[0] : undefined,
          target: targets[1] ? targets[1] : targets[0],
        };
      }

      if (parts[0] === "one-to-many") {
        result.relation = {
          target: targets[0],
          size: split(targets[1], "..").map(_.parseInt),
        };
      }

      return result;
    }

    result.valid = false;
    return result;
  }

  if (_.indexOf(parts[0], ".") > -1) {
    const [module, helper] = split(parts[0], ".");
    result.module = module;
    result.method = helper;
  } else {
    result.method = parts[0];
  }

  if (result.method === "use") {
    result.args = [coerce(parts[1])];
    return result;
  }

  if (!parts[1]) {
    result.args = [];
    return result;
  }

  result.args = parseArgs(split(parts[1], ","));

  return result;
};

export const parseAllProps = (schemaConfig: SchemaConfig): PropsConfig =>
  _.reduce(
    _.keys(schemaConfig.schema),
    (cfgs, prop) =>
      _.set(cfgs, prop, parsePropConfig(prop, schemaConfig.schema[prop])),
    {}
  );
