import { Request, Response } from "express";
import { logger } from "../../../services";
import { Config, Server } from "../../core";
import { Mailer } from "../../services";
import { FakeSMPTServer } from "../../smtp";

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
    const html = await Mailer.template(template, context);
    res.send(html);
  } catch (e) {
    logger.warn("Error while generating the %s template. %O", e);

    res.status(400).json({
      message: `Error generating template "${template}"`,
    });
  }
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
      await Mailer.sendTemplate(to, template, context);
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

export const configureMailTransport = () => {
  if (!Config.enabled("mailer")) {
    return;
  }

  logger.debug("%p%P Mailer handler", 3, 0);

  Server.app.get("/_mail/verify", verifySettingsHandler);
  Server.app.post("/_mail/template", renderTemplateHandler);
  Server.app.post("/_mail/send", sendEmailHandler);

  logger.debug("%p%P [GET]/_mail/verify - Validate mailer settings.", 5, 0);
  logger.debug(
    "%p%P [POST] /_mail/verify - Render an existing email template.",
    5,
    0
  );
  logger.debug("%p%P [POST] /_mail/send - Send emails.", 5, 0);
};
