#!/usr/bin/env node
"use strict";

import { Command, Option } from "commander";
import { callbackify } from "util";
import { App } from "../lib/app";
import { parseConfig } from "../lib/config";
import { logger, setLogLevel } from "../lib/logger";

const program = new Command();

program
  .addOption(
    new Option("-p, --port <number>", "HTTP Port you want to serve the file")
      .env("PORT")
      .argParser(parseInt)
  )
  .addOption(
    new Option(
      "-c, --config <filePath>",
      "Config file to load, defaults to one of (.hhrrc, .hhrrc.json, .hhrrc.js, .hhrrc.cjs, hhrrc.json, hhrrc.js, hhrrc.cjs) in the root of your project."
    )
  )
  .addOption(
    new Option(
      "-l, --logLevel <number>",
      "Log level, must be a number between 1 and 4 (1: debug, 2: info, 3: warn, 4: error)"
    ).default(1, "Defaults o debug level and above.")
  )
  // .addOption(new Option('-o, --outputPath <string>', 'Save the created html output to given path'))
  // .addOption(new Option('-s, --saveOutput', 'Whether to save the created html output to the same directory as the template, this will override the -o / --outputPath option'))
  .showSuggestionAfterError(false)
  .action(async (args, options) => {
    setLogLevel(options.logLevel);

    const config = parseConfig({
      watch: args,
      ...options,
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
