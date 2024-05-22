/* eslint-disable @typescript-eslint/no-explicit-any */
import { FlowParams } from "../types";
import { logger } from "../../services";

export const parseMapped = (params: FlowParams) => {
  const { entry, config, schemaConfig } = params;
  const { prop, module, args } = config;

  if (module === "mapped") {
    const { mappings } = schemaConfig;
    if (mappings && prop in mappings && args[0]) {
      logger.debug(`%p%P mapped: %s => %s `, 5, 1, prop, args[0], mappings[prop][args[0]] || "");
      entry[prop] = mappings[prop][args[0]] || "";
    }
  }

  return params;
};
