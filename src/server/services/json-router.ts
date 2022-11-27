import jsonRouter from "json-server";
import { logger } from "../../services";
import { Config } from "../core";
import { mapDatabase } from "./db-mapper";

export const createJsonRouter = (
  db?: Record<string, Record<string, any>[]>
) => {
  const jsonDb = Config.value<string>("jsonDb");

  const apiRouter = jsonRouter.router<any>(
    (() => {
      if (db) {
        logger.info("%p%P LowDb data provided in memory", 3, 0);
        return db;
      }

      if (jsonDb.endsWith(".json")) {
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
  apiRouter._source = "json-db";

  return apiRouter;
};
