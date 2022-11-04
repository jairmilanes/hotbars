import * as Handlebars from "handlebars";
import handlebarsWax from "handlebars-wax";
import handlebarsLayouts from "handlebars-layouts";
import hbsHelpers from "handlebars-helpers";
import { Config } from "./config";
import { HandlebarsConfigureResponse, SafeObject } from "../types";

export const configureHandlebars = (
  config: Config,
  bootstrapData: SafeObject
): HandlebarsConfigureResponse => {
  const { data, helpers, layouts, partials, partialsOptions } = config;
  const handlebars = Handlebars.create();

  hbsHelpers({ handlebars });

  try {
    const instance = handlebarsWax(handlebars)
      .helpers(handlebarsLayouts)
      .helpers(helpers)
      .data(data)
      .data(bootstrapData)
      // Register system defaults first so user can override them
      .partials(`${config.serverViews}/**/*.{hbs,handlebars}`)
      .partials(`${config.serverPartials}/**/*.{hbs,handlebars}`)
      .partials(layouts, partialsOptions)
      .partials(partials, partialsOptions);

    return { instance };
  } catch (e) {
    const error = e as Error;

    return { error };
  }
};
