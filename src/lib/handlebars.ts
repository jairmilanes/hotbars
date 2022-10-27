import * as Handlebars from "handlebars";
import handlebarsWax from "handlebars-wax";
import handlebarsLayouts from "handlebars-layouts";
import hbsHelpers from "handlebars-helpers";
import { Config } from "./config";
import { HandlebarsWax } from "../types";

export const configureHandlebars = (config: Config): HandlebarsWax => {
  const { data, helpers, layouts, partials, partialsOptions } = config;
  const handlebars = Handlebars.create();

  hbsHelpers({ handlebars });

  return (
    handlebarsWax(handlebars, {
      bustCache: true,
    })
      .helpers(handlebarsLayouts)
      .helpers(helpers)
      .data(data)
      // Register system defaults first so user can override them
      .partials(`${config.serverViews}/**/*.{hbs,handlebars}`)
      .partials(`${config.serverPartials}/**/*.{hbs,handlebars}`)
      .partials(layouts, partialsOptions)
      .partials(partials, partialsOptions)
  );
};
