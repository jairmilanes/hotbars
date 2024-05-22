import { faker } from "@faker-js/faker/locale/pt_BR";
import { FlowParams } from "../types";
import { logger } from "../../services";
import { EnforceLimitError } from "enforce-unique";

export const parseElementArray = (params: FlowParams): FlowParams => {
  const { entry, config } = params;
  const { prop, method, args } = config;

  if (method === "arrayElement") {
    logger.debug(`%p%P arrayElement: %s => %O `, 5, 1, prop, args);

    const fn = faker.helpers.arrayElement;

    if (config.unique) {
      try {
        entry[prop] = config.unique(fn, [args], { maxRetries: args.length })
      } catch(e) {
        if (e instanceof EnforceLimitError) {
          config.unique(false)
          return parseElementArray(params)
        }
        throw e;
      }
    } else {
      entry[prop] = fn(args)
    }
  }

  return params;
};
