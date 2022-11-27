/* eslint-disable @typescript-eslint/no-explicit-any */
import { getMethod } from "../parsers";
import { FlowParams } from "../types";

export const parseHelper = (params: FlowParams) => {
  const { entry, config } = params;
  const { prop, unique, hash, args } = config;

  if (entry[prop] !== undefined) {
    return params;
  }

  const fn = getMethod(config);

  if (fn) {
    if (unique) {
      if (args.length > 1) {
        entry[prop] = unique(fn, [...args]);
      } else {
        entry[prop] = unique(fn, [args[0]]);
      }
      return params;
    }

    if (hash) {
      const unhashedValue = fn(...args);
      entry[`${prop}Unhashed`] = unhashedValue;
      entry[prop] = hash(unhashedValue, 10);
      return params;
    }

    entry[prop] = fn(...args);
  }

  return params;
};
