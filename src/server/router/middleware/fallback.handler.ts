import { logger } from "../../../services";
import { Config, Server } from "../../core";

export const fallbackHandler = () => {
  Server.app.use("*", (req, res) => {
    logger.warn(`Fallback Hanlder: 404 Error: "${req.url}"`);

    return res.status(404).render("notFound", {
      user: req.url,
      ...req.query,
      ...req.params,
      config: Config.get(),
    });
  });

  logger.debug("%p%P Fallback handler...", 3, 0);
};
