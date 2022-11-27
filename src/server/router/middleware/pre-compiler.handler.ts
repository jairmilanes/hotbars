import { Request, Response } from "express";
import { PreRenderer, Server } from "../../core";
import { logger } from "../../../services";

export const preCompilerHandler = () => {
  Server.app.get("/_precompiled", async (req: Request, res: Response) => {
    const code = await PreRenderer.preRender(
      (req.header("referer") || "").indexOf("/_hotbars") > -1
    );

    res.status(200).type(".js").send(code);
  });

  logger.debug("%p%P Pre-compiled handler", 3, 0);
  logger.debug("%p%P [GET]/_precompiled", 5, 0);
};
