#!/usr/bin/env node
"use strict";

import * as dotenv from 'dotenv'
import { Command } from "commander";

dotenv.config();

const program = new Command();

program
  .name("hotbars")
  .alias("htbs")
  .version("1.4.6") // x-release-please-version
  .description("Hotbars - Web building platform.")
  .executableDir("commands")
  .command("serve", "Start the development server")
  .command("fake", "Generate a fake database to use with Hotbars json server.");

program.parse(process.argv);
