#!/usr/bin/env node
"use strict";

import { Command, Option } from "commander";
import { callbackify } from "util";
import { logger } from "../lib/services";
import { cliDefaults, Config } from "../lib/core";
import { Browser } from "../types";
import { App } from "../lib/app";

const program = new Command();

program
  .addOption(
    new Option("-e, --env <number>", "Environment name")
      .env("NODE_ENV")
      .choices(["development", "production"])
      .default(cliDefaults.env)
  )
  .addOption(
    new Option("-p, --port <number>", "HTTP Port you want to serve the file")
      .env("PORT")
      .default(cliDefaults.port)
      .argParser((value) => parseInt(value, 10))
  )
  .addOption(
    new Option("-sp, --socketPort <number>", "Socket port for hot reloading")
      .env("SOCKET_PORT")
      .default(cliDefaults.socketPort)
      .argParser((value) => parseInt(value, 10))
  )
  .addOption(
    new Option(
      "-c, --configName <fileName>",
      'Config file name to load, defaults to hotbarsrc, and must be placed in the root of your project, it may also start with a dot ".hotbarsrc"" and or end with .js, .json or .cjs.'
    ).default(cliDefaults.configName)
  )
  .addOption(
    new Option(
      "-l, --logLevel <number>",
      "Log level, must be a number between 1 and 4 (1: debug, 2: info, 3: warn, 4: error)"
    )
      .choices(["1", "2", "3", "4", "5"])
      .default(cliDefaults.logLevel)
      .argParser((value) => parseInt(value, 10))
  )
  .addOption(
    new Option("-lf, --logFile <number>", "Path where to save log files.")
      .default(cliDefaults.logFilePath)
      .argParser((value) => parseInt(value, 10))
  )
  .addOption(
    new Option("--browser", "Browser to open")
      .choices([Browser.Edge, Browser.Chrome, Browser.Firefox])
      .default(cliDefaults.browser)
  )
  .addOption(
    new Option(
      "-D, --dev",
      "Server dev flag, used for Hotbars development only"
    ).hideHelp()
  )
  // .showSuggestionAfterError(false)
  .action(async (argv) => {
    try {
      const hotBars = new App(argv);

      await hotBars.start();

      const close = callbackify(hotBars.close);

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
    } catch (e) {
      if (Config.get<number>("logLevel") > 1) {
        logger.error(
          "Failed to initialize server, use debug logging level to find out more."
        );
      } else {
        logger.error(e);
      }
    }
  });

program.parse(process.argv);
