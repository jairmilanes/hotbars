import { Config, Server } from "../../core";
import { logger } from "../../../services";

export const errorPageHandler = () => {
  Server.app.get("/error", async (req, res) => {
    logger.error("%p%P Error Page Handler", 3, 0);
    return res.render("error", {
      user: req.url,
      ...req.query,
      ...req.params,
      error: req.errored,
      config: Config.get(),
    });
  });

  logger.debug("%p%P Error page handler", 3, 0);
  logger.debug("%p%P [GET]/error", 5, 0);
};
