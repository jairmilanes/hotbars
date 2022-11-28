/* eslint-disable @typescript-eslint/no-explicit-any,@typescript-eslint/ban-ts-comment */
import * as _ from "lodash";
import { resolve, dirname } from "path";
import createLogger, { Debugger } from "debug";
import { existsSync, mkdirSync } from "fs";
import fileLogger from "day-log-savings";
import { split } from "../utils";

interface Logger {
  log: Debugger;
  debug: Debugger;
  info: Debugger;
  warn: Debugger;
  error: Debugger;
  request: Debugger;
  method: {
    get: Debugger;
    post: Debugger;
    put: Debugger;
    patch: Debugger;
    delete: Debugger;
    params: Debugger;
  };
  file: any;
  update: (level: number) => void;
}

export const log = createLogger("hotbars");

createLogger.formatters.P = (lenght: number) => {
  return _.pad("", lenght === 0 ? 1 : lenght, lenght === 0 ? "-" : "*");
};

createLogger.formatters.p = (lenght: number) => {
  return _.pad("", lenght);
};

createLogger.formatters.S = (str: string) => {
  return _.toUpper(str);
};

const levelNames: { [level: number]: string } = {
  0: ":log:2",
  1: ":debug:8",
  2: ":info:4",
  3: ":warn:11",
  4: ":error:1",
  5: ":request:202",
  6: "method:get:63",
  7: "method:post:35",
  8: "method:put:132",
  9: "method:patch:94",
  10: "method:delete:197",
  11: "method:options:75",
  12: "method:head:75",
  13: "method:params:111",
};

// @ts-ignore
export const logger: Logger = {
  log: createLogger("hotbars"),
  update: (level: number) => {
    if (level < _.get(createLogger, "_startLevel", 1)) {
      level = _.get(createLogger, "_startLevel", 1);
    }

    let enabledStr = "hotbars,hotbars:*";

    for (let i = 1; i <= 4; i++) {
      if (i >= level) {
        const namespace = _.split(levelNames[i], ":")[1];
        enabledStr += `,hotbars:${namespace}`;
      }
    }

    createLogger.enable(enabledStr);
  },
};

export const initLogger = (level: number, filePath: string) => {
  _.set(createLogger, "_startLevel", level);

  for (const level in levelNames) {
    const parts: string[] = split(levelNames[level], ":");
    const color = parts.pop();

    if (parseInt(level, 10) > 0) {
      if (_.first(parts) === "method") {
        _.set(logger, parts, log.extend(_.toUpper(_.last(parts) as string)));
      } else {
        _.set(logger, parts, log.extend(_.last(parts) as string));
      }
    }

    const logFn = _.get(logger, parts);

    _.assign(logFn, {
      color,
      namespace: _.padStart(_.get(logFn, "namespace"), 15, "-"),
    });
  }

  // Create log directory if does not exist
  const directoryPath = dirname(resolve(process.cwd(), filePath));

  if (!existsSync(directoryPath)) {
    mkdirSync(directoryPath);
  }

  fileLogger.defaults("root", { path: directoryPath });

  logger.file = fileLogger.write;

  logger.update(level);
};
