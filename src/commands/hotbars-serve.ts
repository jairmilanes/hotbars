#!/usr/bin/env node
"use strict";

import { Command, Option } from "commander";
import { callbackify } from "util";
import { logger } from "../services";
import { Config } from "../server/core";
import { App } from "../server/app";

const program = new Command();

program
  .addOption(
    new Option("-e, --env <string>", "Environment name")
      .env("NODE_ENV")
      .choices(["development", "production"])
  )
  .addOption(
    new Option("-p, --port <number>", "HTTP Port you want to serve the file")
      .env("PORT")
      .argParser((value) => parseInt(value, 10))
  )
  .addOption(
    new Option("-sp, --socketPort <number>", "Socket port for hot reloading")
      .env("SOCKET_PORT")
      .argParser((value) => parseInt(value, 10))
  )
  .addOption(
    new Option(
      "-c, --configName <fileName>",
      'Config file name to load, defaults to hotbarsrc, and must be placed in the root of your project, it may also start with a dot ".hotbarsrc"" and or end with .js, .json or .cjs.'
    )
  )
  .addOption(
    new Option("--logLevel <number>", "The json db schema files directory")
      .choices(["1", "2", "3", "4"])
      .argParser((value) => parseInt(value, 10))
      .default(1)
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
      Config.create(argv);

      const hotBars = new App();

      await hotBars.start();

      const close = callbackify(hotBars.close.bind(hotBars));

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
