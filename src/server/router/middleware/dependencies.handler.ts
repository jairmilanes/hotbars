import express, { Request, Response } from "express";
import { DashboardConfig, Server } from "../../core";
import { set } from "lodash";
import { readFileSync } from "fs";

const dependencies: Record<string, Record<string, string[]>> = {
  calendar: {
    scripts: [

    ],
    styles: [
      "libs/flatpikr.css"
    ]
  },
  gallery: {
    scripts: [
      "libs/splide/splide.js",
      "extensions/modules/gallery.js"
    ],
    styles: [
      "libs/splide/css/themes/splide-skyblue.min.css"
    ]
  }
}

export const dependenciesHandler = () => {
  const depRouter = express.Router()

  set(depRouter, "_source", "dependencies")

  depRouter.get("/", (req: Request, res: Response) => {
    const { deps: userDeps, type } = req.query

    const results: string[] = []
    const deps = (userDeps as string).split(",")

    if (Array.isArray(deps)) {
      for (let i = 0; i < deps.length; i++) {
        const dep = deps[i] as string;

        if (dependencies[dep]) {
          dependencies[dep][type as string].forEach((script) => {
            results.push(
              readFileSync(DashboardConfig.fullPath("public", script)).toString("utf-8")
            )
          })
        }
      }
    }

    if (type === "scripts") {
      return res.type(".js").send(results.join("\n\r"))
    }

    if (type === "styles") {
      return res.type(".css").send(results.join("\n\r"))
    }

    return res.status(404).send("")
  })

  Server.app.use("/_dependencies", depRouter)
}