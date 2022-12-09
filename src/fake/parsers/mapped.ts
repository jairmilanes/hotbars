/* eslint-disable @typescript-eslint/no-explicit-any */
import { FlowParams } from "../types";

export const parseMapped = (params: FlowParams) => {
  const { entry, config, schemaConfig } = params;
  const { prop, module, args } = config;

  if (module === "mapped") {
    const { mappings } = schemaConfig
    if (mappings && prop in mappings && args[0]) {
      entry[prop] = mappings[prop][args[0]] || "";
    }
  }

  return params;
};
