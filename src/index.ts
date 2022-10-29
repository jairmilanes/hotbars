#!/usr/bin/env node
"use strict";

import { Command } from "commander";

const program = new Command();

program
  .name("hotbars")
  .alias("htbs")
  .version('1.3.0') // x-release-please-version
  .description("Hotbars - Web building platform.")
  .executableDir("commands")
  .command("serve", "Start the development server");

program.parse(process.argv);
