import { NextFunction, Request, Response } from "express";
import { logger } from "../../../services";
import { Server } from "../../core";
import { RequestError } from "../../types";

export const errorHandler = () => {
  Server.app.use(
    (err: RequestError, req: Request, res: Response, next: NextFunction) => {
      if (res.headersSent) {
        return next(err);
      }

      if (err.view) {
        // @todo Are we sure if there is an .view it means it was not found?
        logger.error(`View Error: "${err.view.name}" not found`);

        res.status(404);

        return res.render("notFound");
      }

      logger.error(`Server Error: ${req.statusCode} - "${req.url}"`);
      logger.error(`%O`, err);

      res.status(500);

      return res.render("error");
    }
  );

  logger.debug("%p%P Error handler", 3, 0);
};
