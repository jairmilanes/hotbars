import { merge } from "lodash";
import * as Handlebars from "handlebars";
import handlebarsWax from "handlebars-wax";
import handlebarsLayouts from "handlebars-layouts";
import hbsHelpers from "handlebars-helpers";
import { logger } from "../../services";
import * as customHelpers from "../helpers";
import { HandlebarsConfigureResponse } from "../types";
import { Config, DashboardConfig } from "../core";
import { loadData, loadDashboardData } from "../utils";
import { BootstrapData } from "./bootstrap";

export const configureHandlebars = (
  runtime?: typeof Handlebars
): HandlebarsConfigureResponse => {
  const { partialsOptions } = Config.get();
  const handlebars = runtime ? runtime : Handlebars.create();

  hbsHelpers({ handlebars });

  logger.debug(`%p%P Configuring Handlebars...`, 3, 0);

  try {
    const instance = handlebarsWax(handlebars)
      .data(merge(
        loadData("data"),
        loadDashboardData("data")
      ))
      .data(BootstrapData.get())
      .helpers(handlebarsLayouts)
      .helpers(customHelpers)
      .helpers(Config.fullGlobPath("helpers"))
      .partials(Config.fullGlobPath("layouts"), partialsOptions)
      .partials(Config.fullGlobPath("partials"), partialsOptions)
      .partials(Config.fullGlobPath("shared"), partialsOptions)
      // Server spacific files
      .helpers(DashboardConfig.fullGlobPath("helpers"))
      .partials(DashboardConfig.fullGlobPath("layouts"), partialsOptions)
      .partials(DashboardConfig.fullGlobPath("partials"), partialsOptions)
      .partials(DashboardConfig.fullGlobPath("shared"), partialsOptions);

    return { instance, handlebars };
  } catch (e) {
    const error = e as Error;
    logger.error(e);
    return { error };
  }
};
