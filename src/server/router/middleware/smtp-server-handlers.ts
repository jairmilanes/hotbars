import { Request, Response } from "express";
import urlrewrite from "express-urlrewrite";
import { logger } from "../../../services";
import { Server } from "../../core";
import { FakeSMPTServer } from "../../smtp";
import { persistParams } from "../persist-params";

const renderMail = async (req: Request, res: Response) => {
  const notFoundMessage = "Email message not found";

  try {
    if (!req.params.id) {
      return res.status(404).render("notFound", {
        title: notFoundMessage,
        pageName: "message",
      });
    }

    const message = await FakeSMPTServer.db.get(req.params.id);

    if (!message) {
      return res.status(404).render("notFound", {
        title: notFoundMessage,
        pageName: "message",
      });
    }

    if (message.html) {
      return res.type(".html").send(message.html);
    }

    if (message.textAsHtml) {
      return res.render("mail/textEmail", message);
    }

    return res.type(".txt").send(message.text);
  } catch (e) {
    res.status(500).send((e as Error).message);
  }
};

export const smtpMailHandlers = () => {
  logger.debug("%p%P SMTP Server handler at %s", 3, 0);

  // Render a single email
  Server.app.get("/_mail/render/:id", renderMail);
  // Rewrite to mails to reduce repetitiveness
  Server.app.use(urlrewrite("/_mail/*", "/_mail/mails/$1"));
  Server.app.use(urlrewrite("/_mail*", "/_mail/mails$1"));

  Server.app.use("/_mail", persistParams, FakeSMPTServer.router);
};
