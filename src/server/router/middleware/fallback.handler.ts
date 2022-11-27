import { logger } from "../../../services";
import { Config, Server } from "../../core";

export const fallbackHandler = () => {
  Server.app.use("*", (req, res) => {
    logger.warn(`404 Error: "${req.url}"`);
    res.status(404);
    return res.render("notFound", {
      user: req.url,
      ...req.query,
      ...req.params,
      config: Config.get(),
    });
  });

  logger.debug("%p%P Fallback handler...", 3, 0);
};
