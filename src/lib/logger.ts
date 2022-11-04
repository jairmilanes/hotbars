import createLogger, { Debugger } from "debug";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import { resolvePath } from "../utils/path";

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

export const setLogLevel = (level: number) => {
  let enabledStr = "hotbars:*";

  for (let i = 1; i <= 4; i++) {
    if (i < level) {
      enabledStr += `,-hotbars:${levelNames[i]}`;
    }
  }

  createLogger.enable(enabledStr);
};

levels["debug"].color = `${8}`;
levels["info"].color = `${4}`;
levels["warn"].color = `${11}`;
levels["error"].color = `${1}`;

const request = log.extend("request");

request.color = `${202}`;

const logName = "logs/debug.txt";

export const logger = {
  debug: levels["debug"],
  info: levels["info"],
  warn: levels["warn"],
  error: levels["error"],
  request,
  file: (...messages: any[]) => {
    const msg = messages.reduce((m, ms) => {
      if (typeof ms === "string") {
        return m.concat(" ", ms);
      }

      return m.concat("\r\n", JSON.stringify(ms, null, 4));
    }, "");

    writeFileSync(resolvePath(__dirname, "..", "..", logName), msg + "\r\n", {
      encoding: "utf8",
      flag: "as+",
    });
  },
};
