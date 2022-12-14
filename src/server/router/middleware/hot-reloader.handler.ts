import { logger } from "../../../services";
import { Server, EventManager, ServerEvent, Config } from "../../core";
import { Env, WatcherChange, WatcherEvent } from "../../types";

const reloadAllClients = (change: WatcherChange) => {
  const { clients } = Server.ws;

  logger.debug(`%p%P reloading ${clients.size} clients...`, 1, 0);

  clients.forEach((ws) => {
    if (ws) {
      ws.send(
        JSON.stringify({ type: change.type, file: change.path }),
        (error) => {
          if (error) {
            logger.error("%p Websocket error %O", 2, error);
          }
        }
      );
    }
  });

  logger.debug("%p Done.", 2);
};

export const hotReloadHandler = () => {
  if (!Config.is("env", Env.Dev)) {
    // no hot reloading needed in other environments
    return;
  }

  Server.app.ws("/ws/_connect", (ws) => {
    Server.ws.clients.add(ws);

    logger.debug("Hot reload clients %s", Server.ws.clients.size);

    ws.on("close", () => {
      Server.ws.clients.delete(ws);
      logger.debug(
        "Hot reload client disconnected, %s still connected.",
        Server.ws.clients.size
      );
    });
  });

  EventManager.i.on(ServerEvent.HOT_RELOAD, reloadAllClients);

  logger.debug("%p%P Hot reloading socket", 3, 0);
};
