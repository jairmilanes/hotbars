import { joinPath } from "./path-helpers";
import { Config } from "../core";
import { existsSync } from "fs";

export const getServerViewPath = (name: string): string | undefined => {
  const prefixedName = name.startsWith("_") ? name : `_${name}`;
  const path = joinPath(Config.get("serverViews"), `${prefixedName}.hbs`);

  if (existsSync(path)) return path;
};
