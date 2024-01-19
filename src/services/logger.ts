/* eslint-disable @typescript-eslint/no-explicit-any,@typescript-eslint/ban-ts-comment */
import * as _ from "lodash";
import createLogger, { Debugger } from "debug";
import fileLogger from "day-log-savings";
import util from "util";
import { split } from "../utils";
import { getServerDataDir } from "../server/utils/get-server-data-dir";

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

    let enabledStr = "hotbars";

    for (let i = 1; i <= 4; i++) {
      if (i >= level) {
        const namespace = _.split(levelNames[i], ":")[1];
        enabledStr += `,hotbars:${namespace}`;
      }
    }

    for (let i = 5; i < _.keys(levelNames).length; i++) {
      const parts = _.split(levelNames[i], ":");

      if (parts[0] === "method") {
        enabledStr += `,hotbars:${_.toUpper(parts[1])}`;
      } else {
        enabledStr += `,hotbars:${parts[1]}`;
      }
    }

    createLogger.enable(enabledStr);
  },
};

const iniFileLogger = () => {
  fileLogger.defaults('write', {
    prefix: 'DEBUG',
    length: 2000,
    format: {
      message: '{"prefix": "%prefix", "date": "%date", "time": "%time", "message": "%message"}',
      date: '%day-%month-%year',
      time: '%hour:%minute'
    }
  });
  // @ts-ignore
  // fileLogger.defaults('read', { array: true, blanks: false });
  fileLogger.defaults("root", { path: getServerDataDir("logs") });
}

const format = (...args: any[]) => {
  args[0] = createLogger.coerce(args[0]);

  if (typeof args[0] !== 'string') {
    // Anything else let's inspect with %O
    args.unshift('%O');
  }

  // Apply any `formatters` transformations
  let index = 0;
  args[0] = args[0].replace(/%([a-zA-Z%])/g, (match: any, format: any) => {
    // If we encounter an escaped % then don't increase the array index
    if (match === '%%') {
      return '%';
    }
    index++;
    const formatter = createLogger.formatters[format];
    if (typeof formatter === 'function') {
      const val = args[index];
      const thiss = { inspectOpts: {}}
      match = formatter.call(thiss, val);

      // Now we need to remove `args[index]` since it's inlined in the `format`
      args.splice(index, 1);
      index--;
    }
    return match;
  });

  return util.format(...args);
}

const wrap = (logFn: any, parts: string[], toFile: boolean) => {
  return (...args: any[]) => {
    logFn(...args)

    if (toFile) {
      const options = { console: false, prefix: 'LOG' };

      if (parts[0] !== "method") {
        options.prefix = _.toUpper(parts[0]);
      }

      if (parts[0] === "method") {
        options.prefix = _.toUpper("request".concat(":", parts[1]));
      }

      // @ts-ignore
      fileLogger.write(format(...args), options);
    }
  }
}

export const initLogger = (level: number, toFile = true) => {
  _.set(createLogger, "_startLevel", level);

  iniFileLogger();

  for (const level in levelNames) {
    const parts: string[] = split(levelNames[level], ":");

    const color = parts.pop();

    if (parseInt(level, 10) > 0) {
      let logFn;

      if (_.first(parts) === "method") {
        logFn = log.extend(_.toUpper(_.last(parts) as string))
        // _.set(logger, parts, wrap(log.extend(_.toUpper(_.last(parts) as string)), parts, toFile));
      } else {
        logFn = log.extend(_.last(parts) as string)
        // _.set(logger, parts, wrap(log.extend(_.last(parts) as string), parts, toFile));
      }

      _.assign(logFn, {
        color,
        namespace: _.padStart(_.get(logFn, "namespace"), 15, "-"),
      });

      _.set(logger, parts, wrap(logFn, parts, toFile));
    }
  }

  logger.update(level);
};
