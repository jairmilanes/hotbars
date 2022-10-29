#!/usr/bin/env node
"use strict";

import { Command, Option } from "commander";
import { callbackify } from "util";
import { App } from "../lib/app";
import { parseConfig } from "../lib/config";
import { logger, setLogLevel } from "../lib/logger";
import { Browser } from "../types";

const program = new Command();

program
  .addOption(
    new Option("-e, --env <number>", "Environment name")
      .env("PORT")
      .choices(['development', 'production'])
      .default('development')
  )
  .addOption(
    new Option("-p, --port <number>", "HTTP Port you want to serve the file")
      .env("PORT")
      .default(3000)
      .argParser((value => parseInt(value, 10)))
  )
  .addOption(
    new Option("-sp, --socketPort <number>", "Socket port for hot reloading")
      .env("PORT")
      .default(5001)
      .argParser((value => parseInt(value, 10)))
  )
  .addOption(
    new Option(
      "-c, --configName <filePath>",
      "Config file name to load, defaults to hotbarsrc, and must be placed in the root of your project, it may also start with a dot \".hotbarsrc\"\" and or end with .js, .json or .cjs."
    ).default('hotbarsrc')
  )
  .addOption(
    new Option(
      "-l, --logLevel <number>",
      "Log level, must be a number between 1 and 4 (1: debug, 2: info, 3: warn, 4: error)"
    )
      .choices(['1', '2', '3', '4', '5'])
      .default(1)
      .argParser((value => parseInt(value, 10)))
  )
  .addOption(
    new Option('--browser', 'Browser to open')
      .choices([Browser.Edge, Browser.Chrome, Browser.Firefox])
  )
  // .showSuggestionAfterError(false)
  .action(async (args) => {
    setLogLevel(args.logLevel);

    const config = parseConfig({
      watch: args,
      ...args,
    });

    logger.info(`Initializing server...`);

    const server = new App(config);

    await server.start();

    const close = callbackify(server.close);

    process.on("SIGTERM", () => {
      logger.debug("SIGTERM signal received.");

      close((error: Error, code: number) => {
        process.exit(code);
      });
    });

    process.stdin.resume();

    process.on("SIGINT", () => {
      logger.debug("SIGINT signal received");

      close((error: Error, code: number) => {
        logger.debug("Done!");
        process.exit(code);
      });
    });
  });

program.parse(process.argv);
