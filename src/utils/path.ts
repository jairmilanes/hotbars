import * as path from "path";
import { platform } from "os";

export const slash = (str: string) => {
  if (platform() === "win32") {
    return str.split(path.sep).join(path.posix.sep);
  }
  return str;
};

export const joinPath = (...paths: string[]): string => {
  return slash(path.join(...paths));
};

export const resolvePath = (...paths: string[]): string => {
  return slash(path.resolve(...paths));
};

export const basename = path.basename;
export const extname = path.extname;
