#!/usr/bin/env node
"use strict";

import { Command } from "commander";

const program = new Command();

program
  .name("hhr")
  .description("Handlebars hot reload")
  .executableDir("commands")
  .command("serve", "Start the development server");

program.parse(process.argv);
