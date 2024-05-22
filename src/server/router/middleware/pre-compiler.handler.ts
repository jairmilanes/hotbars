import { Request, Response } from "express";
import { PreRenderer, Server } from "../../core";
import { logger } from "../../../services";



export const preCompilerHandler = () => {
  Server.app.post("/_precompile", async (req: Request, res: Response) => {

    try {
      const templates = req.body
      const code = await PreRenderer.preload(
        templates
      );

      return res.status(200).jsonp(code);
    } catch(e) {
      return res.status(500).json(e)
    }
  });


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
