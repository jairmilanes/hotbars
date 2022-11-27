import { Config, Server } from "../../core";
import { logger } from "../../../services";

export const errorPageHandler = () => {
  Server.app.get("/error", async (req, res) => {
    return res.render("error", {
      user: req.url,
      ...req.query,
      ...req.params,
      config: Config.get(),
    });
  });

  logger.debug("%p%P Error page handler", 3, 0);
  logger.debug("%p%P [GET]/error", 5, 0);
};
