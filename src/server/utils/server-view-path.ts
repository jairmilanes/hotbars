import { joinPath } from "./path-helpers";
import { DashboardConfig } from "../core";
import { existsSync } from "fs";

export const getServerViewPath = (name: string): string | undefined => {
  const prefixedName = name.startsWith("_") ? name : `_${name}`;
  const path = joinPath(DashboardConfig.get("views"), `${prefixedName}.hbs`);

  if (existsSync(path)) return path;
};
