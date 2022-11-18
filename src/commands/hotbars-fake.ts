#!/usr/bin/env node
"use strict";

import { Command } from "commander";
import { cliDefaults, Config } from "../lib/core";
import { initLogger } from "../lib/services";
import { generate } from "./fake";

const program = new Command();

program
  .action((args) => {
  initLogger(cliDefaults.logLevel, cliDefaults.logFilePath);
  Config.create(args || {});
  generate();
});

program.parse(process.argv);
