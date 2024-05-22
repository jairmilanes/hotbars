import { logger } from "../../../services";
import { Config, Server } from "../../core";

export const fallbackHandler = () => {
  Server.app.use("*", (req, res) => {
    logger.warn(`Fallback Hanlder: 404 Error: [%s]%s %o`, req.method, req.baseUrl, req.params);

    return res.status(404).render("notFound", {
      user: req.url,
      ...req.query,
      ...req.params,
      config: Config.get(),
    });
  });
};
