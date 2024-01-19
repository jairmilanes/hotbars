import * as _ from "lodash";
import frontMatter from "front-matter";
import htmlPretify from "html-prettify"
import * as htmlfy from 'htmlfy'
import { logger } from "../../services";
import {
  HandlebarsWax,
  InjectionData,
  SafeObject,
  WatcherChange,
} from "../types";
import { loadTemplate } from "../utils";
import { HandlebarsException } from "../exceptions";
import { configureHandlebars } from "../services";
import { Config, DashboardConfig } from "../core";
import { EventManager, ServerEvent } from "./event-manager";

export class Renderer {
  private static instance: Renderer;

  private hbs?: HandlebarsWax;

  private injections: InjectionData[] = [
    {
      regex: [
        // eslint-disable-next-line no-useless-escape
        "<link.+/>",
        "</head>",
      ],
      tag: "hotbarsHead",
    },
    {
      regex: ["</body>"],
      tag: "hotbarsFooter",
    },
  ];

  static create(): void {
    logger.info(`%p%P Renderer`, 1, 1);
    this.instance = new Renderer();

    const reconfigure = this.instance.configure.bind(this.instance);

    EventManager.i.on(ServerEvent.FILES_CHANGED, reconfigure);
    EventManager.i.on(ServerEvent.USER_RUNTIME_CHANGED, reconfigure);
    EventManager.i.on(ServerEvent.DASHBOARD_RUNTIME_CHANGED, reconfigure);

    this.instance.configure();
  }

  static get() {
    return this.instance;
  }

  async engine(
    path: string,
    options: any,
    callback: (e?: Error, rendered?: string) => void
  ): Promise<void> {
    try {
      const html = await this.render(path, options);
      callback(undefined, html);
    } catch (e) {
      callback(e as Error);
    }
  }

  configure(data?: WatcherChange): void {
    if (!data) {
      logger.debug(`%p%P Configuring renderer...`, 3, 0);
    } else {
      logger.debug(`%p%P Re-configuring renderer...`, 1, 1);
    }

    const { instance, error } = configureHandlebars();

    if (instance) {
      this.hbs = instance;
    }

    if ((error || !instance) && !this.hbs) {
      throw new HandlebarsException("Failed to initialize Handlebars", error);
    }

    if (data) {
      EventManager.i.emit(ServerEvent.HOT_RELOAD, data);
    }
  }

  async renderPartial(path: string, key: string, context: object) {
    logger.debug(`Rendering partial %s`, path.replace(process.cwd(), ""));

    const { template } =
    (await loadTemplate(path, Config.get("encoding"), key)) || {};

    if (!template) {
      throw new Error(`Partial "${path}" not found.`);
    }

    const html = this.compile(template, context)

    if (Config.get("dev")) {
      return htmlfy.prettify(html || "", { strict: true, tab_size: 2})
    } else {
      return htmlfy.minify(html || "")
    }
  }

  async render(path: string, options: object): Promise<string> {
    logger.debug(`Rendering %s`, path.replace(process.cwd(), ""));

    const { template } =
      (await loadTemplate(path, Config.get("encoding"))) || {};

    if (!template) {
      throw new Error(`Template "${path}" not found.`);
    }

    logger.debug(`%p%P Teamplate "%s" loaded.`, 1, 1, path);

    const { attributes, body } = frontMatter(template);

    if (attributes) {
      logger.debug(`%p%P Frontmatter %o`, 1, 1, attributes);
    }

    const context = {
      attributes: attributes as SafeObject,
      ...(options || {}),
    };

    try {
      const html = _.flow([
        (html) => this.compile(html, context),
        (html) => this.inject(html as string),
        (html) => this.compile(html, context),
      ])(body);

      logger.debug(`%p%P Page compiled.`, 1, 1);

      if (Config.get("dev")) {
        return htmlfy.prettify(html || "", { strict: true, tab_size: 2})
      } else {
        return htmlfy.minify(html || "")
      }
    } catch (error) {
      logger.error("Failed to compile %O", error);
      return this.render(
        DashboardConfig.fullPath("default_views", "error", ".hbs"),
        { ...options, error }
      );
    }
  }

  private compile(content: string, context = {}) {
    return this.hbs?.compile(content)({
      lang: Config.get("currentLanguage"),
      env: Config.get<string>("env"),
      dev: Config.get<boolean>("dev"),
      ...context,
    });
  }

  private inject(html: string): string {
    // Only attempt injection if user has not done it already
    const mustInject = this.injections.filter((injection) => {
      return html.match(`<!-- ${injection.tag} -->`) === null;
    });

    if (mustInject.length) {
      return mustInject.reduce(
        (injectedHtml, injection) =>
          this.injectScripts(injectedHtml, injection),
        html
      );
    }

    return html;
  }

  private injectScripts(html: string, injection: InjectionData): string {
    const targetTag = this.findTargetTag(html, injection);

    logger.debug(`%p%P Injecting {{> ${injection.tag}}}`, 1, 1);

    if (targetTag) {
      return html.replace(targetTag, `{{> ${injection.tag}}}\n\r${targetTag}`);
    }

    return html;
  }

  private findTargetTag(html: string, injection: InjectionData) {
    return injection.regex.reduce<string | null>((match, regex) => {
      if (!match) {
        const result = new RegExp(regex, "i").exec(html);
        return !result ? null : result[0];
      }

      return match;
    }, null);
  }
}
