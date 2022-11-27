import { Config, Server } from "../../core";
import { createJsonRouter } from "../../services";
import { logger } from "../../../services";

export const jsonDbHandler = () => {
  if (Config.enabled("jsonServer") && Config.get("jsonDb")) {
    const jsonRouter = createJsonRouter();

    Server.app.use("/_db", (req, res) => res.jsonp(jsonRouter.db.getState()));
    Server.app.use("/_api", jsonRouter);

    logger.debug("%p%P Json DB handlers", 3, 0);
  }
};
