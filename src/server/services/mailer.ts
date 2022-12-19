/* eslint-disable @typescript-eslint/no-explicit-any */
import * as _ from "lodash";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import nodemailer, { Transporter } from "nodemailer";
import Mail from "nodemailer/lib/mailer";
import Handlebars from "handlebars";
import hbsHelpers from "handlebars-helpers";
import handlebarsWax from "handlebars-wax";
import handlebarsLayouts from "handlebars-layouts";
import { readFile } from "fs/promises";
import * as customHelpers from "../helpers";
import { logger } from "../../services";
import { joinPath, loadDashboardData, loadData } from "../utils";
import { Config, DashboardConfig, EventManager, ServerEvent } from "../core";
import { existsSync } from "fs";

export class Mailer {
  static instance: Mailer;

  private transport: Transporter;

  private renderer: typeof Handlebars;

  private constructor() {
    logger.debug(`%p%P Mailer`, 1, 1);
    this.renderer = this.configureRenderer();

    const transportOptions: SMTPTransport.Options = {
      host: Config.get("mailer.smtp.host"),
      port: Config.get("mailer.smtp.port"),
      from: Config.get("mailer.smtp.from"),
      auth: {
        user: Config.get("mailer.smtp.username"),
        pass: Config.get("mailer.smtp.password"),
      },
    };

    logger.debug("%p%P Options %o", 3, 0, transportOptions);

    this.transport = nodemailer.createTransport(transportOptions);

    EventManager.i.on(ServerEvent.EMAIL_FILES_CHANGED, () => {
      logger.debug(`%p%P Reconfiguring email files`, 1, 1);
      this.renderer = this.configureRenderer();
    });
  }

  static create() {
    if (Config.enabled("mailer")) {
      this.instance = new Mailer();
    }
  }

  static async verify() {
    if (!Config.enabled("mailer")) {
      throw new Error(
        "Mailer is disabled, enabled it in your configuration file."
      );
    }
    return this.instance.transport.verify();
  }

  static async send(to: string, subject: string, text: string) {
    if (_.startsWith(subject, "#")) {
      subject = this.instance.getFromContext(subject);
    }

    return this.instance.transport.sendMail(
      this.instance.options(to, subject, text)
    );
  }

  static async sendHtml(to: string, subject: string, html: string) {
    if (_.startsWith(subject, "#")) {
      subject = this.instance.getFromContext(subject);
    }

    return this.instance.transport.sendMail(
      this.instance.options(to, subject, html)
    );
  }

  static async sendTemplate(
    to: string,
    subject: string,
    templateName: string,
    context: Record<string, any>
  ) {
    const html = await this.template(templateName, context);

    subject =
      subject ||
      this.instance.getFromContext(
        _.join([_.camelCase(templateName), "subject"], ".")
      );

    return this.instance.transport.sendMail(
      this.instance.options(to, subject, "", html)
    );
  }

  static async template(
    templateName: string,
    context: Record<string, any>
  ): Promise<string> {
    const template = await this.instance.getEmailTemplate(templateName);
    const _context = {
      lang: Config.get("currentLanguage"),
      ...context,
    };

    return _.flow([
      (html) => this.instance.renderer.compile(html)(_context),
      (html) => this.instance.renderer.compile(html)(_context),
    ])(template);
  }

  private getFromContext(key: string, context?: Record<string, any>) {
    if (Config.enabled("language")) {
      const lang =
        context?.lang || context?.language || Config.get("currentLanguage");
      const value = _.get(this.renderer, `context.${lang}.${key}`);
      if (value) return value;
    }

    return _.get(this.renderer, key);
  }

  private async getEmailTemplate(
    templateName: string
  ): Promise<string | undefined> {
    const userPath = joinPath(
      Config.fullPath("mailer.templates"),
      `${templateName}.hbs`
    );

    if (existsSync(userPath)) {
      return readFile(userPath, { encoding: "utf-8" });
    }

    const path = joinPath(
      DashboardConfig.fullPath("mailer.templates"),
      `${templateName}.hbs`
    );

    if (existsSync(path)) {
      return readFile(path, { encoding: "utf-8" });
    }
  }

  private options(
    to: string,
    subject: string,
    text: string,
    html?: string
  ): Mail.Options {
    return {
      from: Config.get("smpt.from"),
      to,
      subject,
      encoding: "utf-8",
      text,
      html,
    };
  }

  private configureRenderer(): typeof Handlebars {
    const handlebars = Handlebars.create();

    hbsHelpers({ handlebars });

    return handlebarsWax(handlebars)
      .helpers(handlebarsLayouts)
      .helpers(customHelpers)
      .data(loadDashboardData("mailer.data"))
      .partials(DashboardConfig.fullGlobPath("mailer.layouts", ".hbs"))
      .partials(DashboardConfig.fullGlobPath("mailer.partials", ".hbs"))
      .data(loadData("mailer.data"))
      .partials(Config.fullGlobPath("mailer.layouts", ".hbs"))
      .partials(Config.fullGlobPath("mailer.partials", ".hbs"));
  }
}
