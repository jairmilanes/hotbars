/* eslint-disable @typescript-eslint/no-explicit-any */
import * as _ from "lodash";
import { FlowParams } from "../types";
import { logger } from "../../services";

const getValue = (arg: any, record: Record<string, any>): any => {
  if (_.isArray(arg)) {
    return _.map<any>(arg, (ag: any) => getValue(ag, record));
  }

  if (_.isPlainObject(arg)) {
    return _.reduce(
      _.keys(arg),
      (ag, key) => {
        return {
          ...ag,
          [key]: getValue(arg[key], record),
        };
      },
      {}
    );
  }

  if (_.isString(arg) && arg.startsWith("prop.")) {
    return record[arg.split(".")[1]];
  }

  return arg;
};

export const parseArgs = (params: FlowParams) => {
  const { entry, config } = params;
  const parsed = config.args.map((arg) => getValue(arg, entry));

  logger.debug(`%p%P args %o`, 5, 1, parsed);

  return _.set(params, "config.args", parsed);
};
