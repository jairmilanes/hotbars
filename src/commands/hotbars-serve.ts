#!/usr/bin/env node
"use strict";
import path from "path"
import { config } from 'dotenv'
import { callbackify } from "util";
import { Command, Option } from "commander";
import { logger } from "../services";
import { Config, DashboardConfig } from "../server/core";
import { Hooks } from "../server/services";
Hooks.create()
import { App } from "../server/app";
import { Env } from "../server/types";

const program = new Command();
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime"
import customParseFormat from "dayjs/plugin/customParseFormat"
import utc from "dayjs/plugin/utc"
import localizedFormat from "dayjs/plugin/localizedFormat"
import advancedFormat from "dayjs/plugin/advancedFormat"

dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(customParseFormat);
dayjs.extend(localizedFormat);
dayjs.extend(advancedFormat);

program
  .addOption(
    new Option("-e, --env <string>", "Environment name")
      .env("NODE_ENV")
      .choices([Env.Local, Env.Dev, Env.Test, Env.Prod])
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
      .env("LOG_LEVEL")
      .choices(["1", "2", "3", "4"])
      .argParser((value) => parseInt(value, 10))
      .default(1)
  )
  .addOption(
    new Option("-b, --browser", "Browser to launch in development mode")
      .choices(["chrome", "firefox", "msedge", "safari"])
      .default(null)
  )
  .addOption(
    new Option(
      "-D, --dev",
      "Server dev flag, used for Hotbars development only"
    ).hideHelp().default(false)
  )
  // .showSuggestionAfterError(false)
  .action(async (argv) => {
    try {
      Config.create(argv);
      DashboardConfig.create(argv);

      const envFile = path.join(process.cwd(), "envs", `.${Config.get("env")}`)

      config({ path: envFile })

      if (Config.get("env") === Env.Local) {
        process.env.HOTBARS_LOCAL = "true";
      }

      const hotBars = await App.create();

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
      console.warn(
        "Failed to initialize server, use debug logging level to find out more."
      );
      console.error(e);
    }
  });

program.parse(process.argv);
