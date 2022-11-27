import * as Handlebars from "handlebars";
import handlebarsWax from "handlebars-wax";
import handlebarsLayouts from "handlebars-layouts";
import hbsHelpers from "handlebars-helpers";
import * as customHelpers from "../helpers";
import { HandlebarsConfigureResponse } from "../types";
import { Config } from "../core";
import { loadData } from "../utils";
import { BootstrapData } from "./bootstrap";

export const configureHandlebars = (
  runtime?: typeof Handlebars
): HandlebarsConfigureResponse => {
  const { partialsOptions } = Config.get();
  const handlebars = runtime ? runtime : Handlebars.create();

  hbsHelpers({ handlebars });

  try {
    const instance = handlebarsWax(handlebars)
      .helpers(handlebarsLayouts)
      .helpers(customHelpers)
      .helpers(Config.fullGlobPath("helpers"))
      .data(loadData("data", "json"))
      .data(BootstrapData.get())
      .partials(Config.fullGlobPath("layouts"), partialsOptions)
      .partials(Config.fullGlobPath("partials"), partialsOptions)
      // Server spacific files
      .data(Config.fullGlobPath("serverData", "json"))
      .helpers(Config.fullGlobPath("serverHelpers", "js"))
      .partials(Config.fullGlobPath("serverLayouts", "hbs"))
      .partials(Config.fullGlobPath("serverPartials", "hbs"))
      .partials(Config.fullGlobPath("serverShared", "hbs"))
      .partials(Config.fullGlobPath("serverViews", "hbs"));

    return { instance, handlebars };
  } catch (e) {
    const error = e as Error;

    return { error };
  }
};
