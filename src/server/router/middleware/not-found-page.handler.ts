import { Config, Server } from "../../core";
import { logger } from "../../../services";

export const notFoundPageHandler = () => {
  Server.app.get(["/not-found", "/404"], (req, res) =>
    res.render("notFound", {
      user: req.url,
      ...req.query,
      ...req.params,
      config: Config.get(),
    })
  );

  logger.debug("%p%P 404 page", 3, 0);
  logger.debug("%p%P [GET]/{not-found, 404}", 5, 0);
};
