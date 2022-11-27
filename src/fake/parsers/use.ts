import { FlowParams } from "../types";

export const parseUse = (params: FlowParams) => {
  const { entry, config } = params;

  if (config.method === "use") {
    entry[config.prop] = config.args[0];
  }

  return params;
};
