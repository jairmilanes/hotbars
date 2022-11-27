import * as _ from "lodash";
import frontMatter from "front-matter";
import { logger } from "../../services";
import { HandlebarsWax, InjectionData, SafeObject } from "../types";
import { loadTemplate } from "../utils";
import { HandlebarsException } from "../exceptions";
import { configureHandlebars } from "../services";
import { Config } from "../core";
import { EventManager, ServerEvent } from "./event-manager";

export class Renderer {
  private static instance: Renderer;

  private hbs?: HandlebarsWax;

  private injections: InjectionData[] = [
    {
      regex: [
        // eslint-disable-next-line no-useless-escape
        "<script.+/script>",
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
    logger.debug(`%p%P Renderer`, 1, 1);
    this.instance = new Renderer();

    EventManager.i.on(
      ServerEvent.FILES_CHANGED,
      this.instance.configure.bind(this.instance)
    );

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

  configure(): void {
    const { instance, error } = configureHandlebars();

    if (instance) {
      this.hbs = instance;
    }

    if ((error || !instance) && !this.hbs) {
      throw new HandlebarsException("Failed to initialize Handlebars", error);
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

    const html = _.flow([
      (html) => this.compile(html, context),
      (html) => this.inject(html as string),
      (html) => this.compile(html, context),
    ])(body);

    logger.debug(`%p%P Page compiled.`, 1, 1);

    return html || "";
  }

  private compile(content: string, context = {}) {
    return this.hbs?.compile(content)({
      lang: Config.get("currentLanguage"),
      env: Config.value<string>("env"),
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
