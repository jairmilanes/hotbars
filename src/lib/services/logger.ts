import createLogger, { Debugger } from "debug";
import { existsSync, mkdirSync } from "fs";
import fileLogger from "day-log-savings";
import { dirname } from "path";
import { resolvePath } from "../utils";

export const log = createLogger("hotbars");

const levels: { [level: string]: Debugger } = {};

const levelNames: { [level: number]: string } = {
  1: "debug",
  2: "info",
  3: "warn",
  4: "error",
};

for (const level in levelNames) {
  levels[levelNames[level]] = log.extend(levelNames[level]);
}

levels["debug"].color = `${8}`;
levels["info"].color = `${4}`;
levels["warn"].color = `${11}`;
levels["error"].color = `${1}`;

const request = log.extend("request");

request.color = `${202}`;

type Log = (...args: any[]) => void;
type Logger = { [name: string]: Log };

export const logger: Logger = {
  debug: levels["debug"],
  info: levels["info"],
  warn: levels["warn"],
  error: levels["error"],
  request,
};

export const initLogger = (level: number, filePath: string) => {
  let enabledStr = "hotbars:*";

  for (let i = 1; i <= 4; i++) {
    if (i < level) {
      enabledStr += `,-hotbars:${levelNames[i]}`;
    }
  }

  createLogger.enable(enabledStr);

  // Create log directory if does not exist
  const directoryPath = dirname(resolvePath(process.cwd(), filePath));

  if (!existsSync(directoryPath)) {
    mkdirSync(directoryPath);
  }

  fileLogger.defaults("root", { path: directoryPath });

  logger.file = fileLogger.write;
};
