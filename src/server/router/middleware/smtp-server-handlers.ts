import { Server } from "../../core";
import { FakeSMPTServer } from "../../smtp";
import { logger } from "../../../services";
import { Request, Response } from "express";

const renderMail = async (req: Request, res: Response) => {
  const notFoundMessage = "Email message not found";

  try {
    if (!req.params.id) {
      return res.status(404).send(notFoundMessage);
    }

    const message = await FakeSMPTServer.db.get(req.params.id);

    if (!message) {
      return res.status(404).send(notFoundMessage);
    }

    return res.type(".html").send(message.html);
  } catch (e) {
    res.status(500).send((e as Error).message);
  }
};

export const smtpMailHandlers = () => {
  logger.debug("%p%P SMTP Server handler at %s", 3, 0);
  Server.app.get("/_smtp_db", (req, res) =>
    res.jsonp(FakeSMPTServer.router.db.getState())
  );
  Server.app.use("/_mail_api", FakeSMPTServer.router);
  Server.app.get("/_mail/:id", renderMail);
};
