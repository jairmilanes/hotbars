import { existsSync, mkdirSync, writeFileSync, readFileSync } from "fs";
import { joinPath } from "./path-helpers";
import { Config } from "../core";

export const getServerDataDir = (): string => {
  const path = joinPath(process.cwd(), ".hotbars");

  if (!existsSync(path)) {
    mkdirSync(path);
  }

  return path;
};

export const saveServerFile = (
  filename: string,
  data: string,
  overwrite = true
): string => {
  const path = joinPath(getServerDataDir(), filename);

  if (!overwrite && existsSync(path)) {
    return path;
  }

  writeFileSync(path, data);

  return path;
};

export const getServerFile = (filename: string): string | undefined => {
  const path = joinPath(getServerDataDir(), filename);

  if (existsSync(path)) {
    return readFileSync(path, { encoding: Config.get("encoding") || "utf-8" });
  }

  return undefined;
};
