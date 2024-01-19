import { Request, Response } from "express";
import urlrewrite from "express-urlrewrite";
import { logger } from "../../../services";
import { Config, Server } from "../../core";
import { FakeSMPTServer } from "../../smtp";
import { Mailer } from "../../services";

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

const verifySettingsHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    await Mailer.verify();

    res.json({
      message: "Success, mail server is ready to send messages!",
    });
  } catch (e) {
    logger.warn("Mailer settings verification error %O", e);

    res.status(400).json({
      message: "Validation failed, check your logs for more info.",
      error: (e as Error).message,
    });
  }
};

const renderTemplateHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { template, ...context } = req.body;
  try {
    logger.warn("RENDERING!")
    const html = await Mailer.template(template, context);
    res.send(html);
  } catch (e) {
    logger.error("ERROR RENDERING!")
    logger.warn("Error while generating the %s template. %O", e);

    res.status(400)
      .json({
        message: `Error generating template "${template}"`,
      });
  }
  logger.error("WTF!")
};

const sendEmailHandler = async (req: Request, res: Response) => {
  const { to, subject, template, text, html, context } = req.body; //, context

  try {
    logger.warn("Sending message to %s", to);

    if (text) {
      await Mailer.send(to, subject, text);
    } else if (html) {
      await Mailer.sendHtml(to, subject, html);
    } else {
      await Mailer.sendTemplate(to, subject || "", template, context);
    }

    res.json({
      message: "Message sent!",
    });
  } catch (e) {
    logger.warn("Message send error %O", e);

    res.json({
      message: "Message send failed, check logs for more info.",
    });
  }
};


export const smtpMailHandlers = () => {
  if (!Config.enabled("mailer")) {
    return;
  }

  FakeSMPTServer.router.get("/verify", verifySettingsHandler);
  FakeSMPTServer.router.post("/template", renderTemplateHandler);
  FakeSMPTServer.router.post("/send", sendEmailHandler);
  // Render a single email
  FakeSMPTServer.router.get("/render/:id", renderMail);
  // Rewrite to mails to reduce repetitiveness
  Server.app.use(urlrewrite("/_mail*", "/_mail/mails$1"));
  // Server.app.use(urlrewrite("/_mail/*", "/_mail/mails/$1"));
  Server.app.use("/_mail", FakeSMPTServer.router);
};
