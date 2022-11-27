import * as _ from "lodash";
import { faker } from "@faker-js/faker/locale/pt_BR";
import { PropConfig } from "../types";

export const getMethod = (
  config: PropConfig
): ((...args: any[]) => any) | undefined => {
  const { module, method } = config;
  if (
    _.has(faker, [module as string, method]) &&
    _.isFunction(_.get(faker, [module as string, method]))
  ) {
    return _.get(faker, [module as string, method]);
  }

  if (_.has(_, method) && _.isFunction(_.get(_, method))) {
    return _.get(_, method);
  }
};
