import { FlowParams } from "../types";
import { logger } from "../../services";

export const parseUse = (params: FlowParams) => {
  const { entry, config } = params;

  if (config.method === "use") {
    logger.debug(`%p%P use: %s: `, 5, 1, config.args[0]);
    entry[config.prop] = config.args[0];
  }

  return params;
};
