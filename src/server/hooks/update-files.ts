import { Hooks } from "../services";
import { DataManager } from "../data";
import { logger } from "../../services";

/**
 * Looks for dangling files and removes them, it bases on the diff
 * between the previous record and the current to find dangling files
 * that must be removed.
 */
/* Hooks.register("hb-record-changed", async (e) => {
  const { data, previousData, type } = e

  logger.debug("%p%P Update Files Hook: %O", 1, 0, {
    type: type?.name,
    data,
    previousData
  })

  if (type && previousData) {
    const { fields } = type

    logger.debug("%p%P Type %s", 3, 1, type.name)

    for (let i = 0; i < fields.length; i++) {
      const field = fields[i]

      if (field.type === "upload") {
        if (!data[field.name] && previousData[field.name]) {
          logger.debug("%p%P Dengling file found %s", 3, 1, previousData[field.name])
          try {
            await DataManager.get()
              .from("__files")
              .delete(previousData[field.name])
          } catch(e) {
            logger.error("Error while removing dangling file.")
            logger.error(e)
          }
        }
      }
    }
  }
}) */