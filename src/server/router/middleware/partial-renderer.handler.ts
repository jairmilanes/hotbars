import { Request, Response } from "express";
import { Config, ContextConfig, DashboardConfig, Renderer, Server } from "../../core";
import { logger } from "../../../services";

interface TemplateConfig {
  key: string;
  path: string;
}

async function loadPartial({ key, path }: TemplateConfig, paths: TemplateConfig[], context: object): Promise<string | undefined> {
  try {
    logger.info("%p%P Attempting to load %s:%s", 3, 1, key, path)
    const html = await Renderer.get().renderPartial(path, key, context)

    logger.info(html)

    if (html) {
      return html
    }
  } catch(e) {
    if (paths.length) {
      return loadPartial(paths.shift() as TemplateConfig, paths, context)
    }
  }

  return;
}

async function findAndLoadPartial(req: Request) {

  const paths: TemplateConfig[] = [
    { key: "partials", path: Config.fullPath("partials", req.body.partial as string, `.${Config.get("extname")}`) },
    { key: "precompile", path: Config.fullPath("precompile", req.body.partial as string, `.${Config.get("extname")}`) },
    { key: "shared", path: Config.fullPath("shared", req.body.partial as string, `.${Config.get("extname")}`) },
    { key: "partials", path: DashboardConfig.fullPath("partials", req.body.partial as string, `.${Config.get("extname")}`) },
    { key: "precompile", path: DashboardConfig.fullPath("precompile", req.body.partial as string, `.${Config.get("extname")}`) },
    { key: "shared", path: DashboardConfig.fullPath("shared", req.body.partial as string, `.${Config.get("extname")}`) },
  ]

  return loadPartial(paths.shift() as TemplateConfig, paths, req.body.context)
}


export const partialsHandler = () => {

  Server.app.post("/_partial", async (req: Request, res: Response) => {
    ContextConfig.init(req);

    if (!req.body.partial || !req.body.context) return res.status(400).send("Partial id and or context is missing.")

    const html = await findAndLoadPartial(req)

    if (html) {
      logger.info("%p%P Partial found!", 3, 1)
      return res.type("html").status(200).send(html);
    }

    return res.status(404).send("Partial not found!");
  });
};
