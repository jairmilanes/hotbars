import * as Handlebars from "handlebars";
import handlebarsWax from "handlebars-wax";
import handlebarsLayouts from "handlebars-layouts";
import hbsHelpers from "handlebars-helpers";
import * as customHelpers from "../helpers";
import { HandlebarsConfigureResponse } from "../types";
import { Config, DashboardConfig } from "../core";
import { loadData, loadDashboardData } from "../utils";
import { BootstrapData } from "./bootstrap";
import { logger } from "../../services";

export const configureHandlebars = (
  runtime?: typeof Handlebars
): HandlebarsConfigureResponse => {
  const { partialsOptions } = Config.get();
  const handlebars = runtime ? runtime : Handlebars.create();

  hbsHelpers({ handlebars });

  logger.debug(
    `%p%P Handlebars... %s`,
    1,
    1,
    DashboardConfig.fullGlobPath("helpers")
  );

  try {
    const instance = handlebarsWax(handlebars)
      .data(loadData("data"))
      .data(BootstrapData.get())
      .helpers(handlebarsLayouts)
      .helpers(customHelpers)
      .helpers(Config.fullGlobPath("helpers"))
      .partials(Config.fullGlobPath("layouts"), partialsOptions)
      .partials(Config.fullGlobPath("partials"), partialsOptions)
      .partials(Config.fullGlobPath("shared"), partialsOptions)
      // Server spacific files
      .data(loadDashboardData("data"))
      .helpers(DashboardConfig.fullGlobPath("helpers"))
      .partials(DashboardConfig.fullGlobPath("layouts"))
      .partials(DashboardConfig.fullGlobPath("partials"))
      .partials(DashboardConfig.fullGlobPath("shared"));

    return { instance, handlebars };
  } catch (e) {
    const error = e as Error;
    logger.error(e);
    return { error };
  }
};
