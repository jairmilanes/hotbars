import * as _ from "lodash";
import jsonRouter from "json-server";
import { logger } from "../../services";
import { Config } from "../core";
import { mapDatabase } from "./db-mapper";
import { NextFunction, Response } from "express";
import { DataManager } from "../data";
import { split } from "../../utils";
import { EnhancedJsonDbPayload, RequestEnhanced } from "../types";
import JsonDbAdaptor from "../data/adaptor/jsonDb.adaptor";

const PAGES_SIZE = 10;

const getPageSize = (items: Record<string, any>[], qLimit?: string): number => {
  const limit = qLimit ? parseInt(qLimit as string, 10) : PAGES_SIZE;

  if (items.length > limit) {
    return items.length;
  }

  return limit;
};

/**
 * Enhances the Json Db payload with totals and paging info.
 */
const render = (name: string) => {
  return async (req: RequestEnhanced, res: Response, next: NextFunction) => {
    if (_.toLower(req.method) !== "get") {
      return res.jsonp(res.locals.data);
    }

    const manager = DataManager.get(name);

    const [collection, identifyer] = split(req.path, "/");

    const items = res.locals.data;

    const { query } = req.original;

    if (identifyer) {
      return res.jsonp(res.locals.data);
    }

    // User is querying a collection because there is
    // no identifier.
    if (items.length === 0) {
      return res.status(404).jsonp({
        message: query._page ? "page not found" : "No results for this query",
      });
    }

    if (!Array.isArray(res.locals.data)) {
      return res.status(200).jsonp(res.locals.data)
    }

    const total = await manager.from(collection).size();
    const pageSize: number = getPageSize(items, query._limit as string);
    const page = query._page ? parseInt(query._page as string, 10) : 1;
    const pages = Math.ceil(total / pageSize);

    const response: EnhancedJsonDbPayload = {
      items: res.locals.data,
      total,
      pages,
      page,
      next: null,
      prev: null,
      from: null,
      to: null,
    };

    if (page < pages) {
      response.next = response.page + 1;
    }

    if (page > 1) {
      response.prev = response.page - 1;
    }

    if (response.items.length === 0) {
      response.from = 0;
      response.to = 0;
    } else {
      response.from = page * pageSize - pageSize + 1;

      if (response.from > total) {
        response.from = total;
      }

      response.to = response.from + pageSize - 1;

      if (response.to > total) {
        response.to = total;
      }

      if (response.to - response.from > response.items.length) {
        response.to = response.items.length - 1;
      }
    }

    return res.jsonp(response);
  };
};

export const createJsonRouter = (
  db?: Record<string, Record<string, any>[]> | string,
  name?: string
) => {
  const apiRouter = jsonRouter.router<any>(
    (() => {
      if (_.isPlainObject(db)) {
        logger.debug("%p%P LowDb data provided in memory", 3, 0);
        return db;
      }

      if (_.isString(db)) {
        return db;
      }

      const jsonDb = DataManager.get<JsonDbAdaptor>("jsonDb");

      if (jsonDb) {
        return jsonDb.db;
      }

      const jsonDbConfig = Config.get<string>("jsonDb");

      if (jsonDbConfig.endsWith(".json")) {
        logger.debug(
          "%p%P Loading LowDb from %s",
          3,
          0,
          Config.relPath("jsonDb")
        );
        return Config.relPath("jsonDb");
      }

      logger.debug("%p%P Mapping db files into memory", 3, 0);
      return mapDatabase(Config.get()).db;
    })()
  );

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  apiRouter._source = name || "jsonDb";

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  apiRouter.render = render(name || "jsonDb");

  return apiRouter;
};
