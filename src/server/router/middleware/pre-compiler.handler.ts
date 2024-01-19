import { Request, Response } from "express";
import { PreRenderer, Server } from "../../core";

export const preCompilerHandler = () => {
  Server.app.get("/_precompiled", async (req: Request, res: Response) => {

    try {
      const code = await PreRenderer.preRender(
        (req.header("referer") || "").indexOf("/_hotbars") > -1
      );

      return res.status(200).type(".js").send(code);
    } catch(e) {
      return res.status(500).send(e)
    }
  });
};
