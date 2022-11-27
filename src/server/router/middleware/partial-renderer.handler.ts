import { Request, Response } from "express";
import { Server } from "../../core";
import { logger } from "../../../services";

export const partialsHandler = () => {
  Server.app.get("/_partial/:partialId", (req: Request, res: Response) => {
    res.status(200).render(req.params.partialId, req.params);
  });

  logger.debug("%p%P Partial renderer", 3, 0);
  logger.debug("%p%P [GET]/_partial/:partialId", 5, 0);
};
