#!/usr/bin/env node
"use strict";

// import "../paths";
import { Command, Option, Argument } from "commander";
import { Config } from "../server/core";
import { generateDb } from "../fake";

const program = new Command();

program
  .addArgument(
    new Argument("<dest>", "the output json data file path.").argOptional()
  )
  .addOption(
    new Option(
      "--sourceDir <string>",
      "The source directory where the schemaDir is located."
    )
  )
  .addOption(
    new Option("--schemaDir <schemaDir>", "The json db schema files directory.")
  )
  .addOption(
    new Option(
      "--logLevel <number>",
      "The log level to use 1 is the lowest starting with debug messages."
    )
      .choices(["1", "2", "3", "4"])
      .argParser((value) => parseInt(value, 10))
  )
  .addOption(
    new Option("--verbose", "Will log more data than usual.").default(false)
  )
  .action((dest, argv) => {
    Config.create({
      logLevel: argv.logLevel,
      source: argv.sourceDir,
      jsonSchema: argv.schemaDir,
      jsonDb: dest,
      verbose: argv.verbose,
    });

    generateDb();
  });

program.parse(process.argv);
