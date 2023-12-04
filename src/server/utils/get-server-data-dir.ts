import { existsSync, mkdirSync, writeFileSync, readFileSync } from "fs";
import { joinPath } from "./path-helpers";
import { Config } from "../core";

export const getServerDataDir = (...parts: string[]): string => {
  const path = joinPath(process.cwd(), ".hotbars", ...(parts || []));

  if (!existsSync(path)) {
    mkdirSync(path, { recursive: true });
  }

  return path;
};

export const getServerFilePath = (...parts: string[]): string => {
  const filename = parts.pop()
  const serverDir = getServerDataDir(...parts);
  return joinPath(serverDir, filename as string);
}

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
