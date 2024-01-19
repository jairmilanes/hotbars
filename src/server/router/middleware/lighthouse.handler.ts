// import fs from 'fs';
import fss from "node:fs";
import fs from "node:fs/promises";
import path from "path";
import {set} from "lodash"
import express, { Request, Response } from "express"
import { Config, Server } from "../../core";
import { DataManager } from "../../data";
import { logger } from "../../../services";

async function saveReport(reportPath: string, reportHtml: string) {
  try {
    const fullPath = Config.fullPath("public", "reports", reportPath)

    logger.log("Saving report", fss.existsSync(fullPath))

    if (!fss.existsSync(fullPath)) {
      logger.log("Create directory", fullPath)
      await fs.mkdir(fullPath, { recursive: true });
    }

    await fs.writeFile(
      path.join(fullPath, "latest.html"),
      reportHtml,
      { flag: "w+" }
    );
  } catch(e) {
    logger.error(e)
  }
}

async function scoreUrl(req: Request, res: Response) {
  const table = "__lighthouse"
  const lighthouse = await import('lighthouse/core/index.cjs')
  const chromeLauncher = await import('chrome-launcher')
  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });

  if (!req.query?.url) {
    return res.status(400).json({ message: "error" })
  }

  const options = {
    logLevel: 'info',
    output: 'html',
    onlyCategories: [
      'performance'
    ],
    port: chrome.port,
    formFactor: req.query.formFactor === "mobile" ? "mobile" : "desktop",
    screenEmulation: {
      mobile: req.query.formFactor === "mobile",
      width: req.query.formFactor === "mobile" ? 414 : 1920,
      height: req.query.formFactor === "mobile" ? 736 : 1080,
      deviceScaleFactor: 0
    }
  };

  try {
    const url: string = req.query?.url as string;
    const runnerResult = await lighthouse.default(url, options as any);

    if (!runnerResult) {
      return res.status(400).json({ message: "error"})
    }

    const db = DataManager.get()

    const hasCol = db.hasCollection(table)

    if (!hasCol) {
      await db.createCollection(table)
    }

    const path = url
      .replace(/http(s)?:\/\//, "")
      .split("/")

    path.shift()

    const record: Record<string, any> = {
      url,
      screenshot: (runnerResult.lhr?.audits["final-screenshot"].details as any)?.data,
      path: path.join("/"),
      score: runnerResult.lhr?.categories.performance.score || "n/a",
      date: Date.now(),
      html: runnerResult.report
    }

    await db.from(table).insert(record)
    // await saveReport(path.join("/"), record.html)

    chrome.kill();

    if (req.query.format === "json") {
      return res.json(record)
    }

    return res.send(record.html)
  } catch(e) {
    if (req.query.format === "json") {
      return res.status(400).json({
        message: (e as Error).message
      })
    }

    return res.status(400).send("Error while generating report")
  }

}

export const lighthouseHandler = () => {
  const router = express.Router()

  set(router, "_source", "lighthouse")

  router.get("/score", scoreUrl)

  Server.app.use("/lighthouse", router)
}