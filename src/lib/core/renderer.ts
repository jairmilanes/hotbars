import frontMatter from "front-matter";
import { HandlebarsWax, InjectionData, SafeObject } from "../../types";
import { loadTemplate } from "../utils";
import { HandlebarsException } from "../exeptions/handlebars.exception";
import { configureHandlebars } from "../services";
import { logger } from "../services";
import { Config } from "./config";

export class Renderer {
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

  configure(): void {
    const { instance, error } = configureHandlebars();

    if ((error || !instance) && !this.hbs) {
      throw new HandlebarsException("Failed to initialize Handlebars", error);
    }

    if (instance) {
      this.hbs = instance;
    }
  }

  async engine(
    path: string,
    options: object,
    callback: (e?: Error, rendered?: string) => void
  ): Promise<void> {
    const html = await this.render(path, options);

    callback(undefined, html);
  }

  async render(path: string, options: object): Promise<string> {
    logger.debug(`Rendering: ${path.replace(process.cwd(), "")}`);

    const { template } = await loadTemplate(path, Config.get("encoding"));

    logger.debug(`-- Teamplate loaded.`);

    const { attributes, body } = frontMatter(template);

    if (attributes) {
      logger.debug(`-- Frontmatter %o`, attributes);
    }

    let html = this.hbs?.compile(body)({
      env: Config.value<string>("env"),
      // config: Config.get() as unknown as SafeObject,
      attributes: attributes as SafeObject,
      ...(options || {}),
    });

    logger.debug(`-- Template compiled.`);

    html = this.inject(html as string);

    logger.debug(`-- Page rendered successfuly!`);

    return html;
  }

  private inject(html: string): string {
    // Only attempt injection if user has not done it already
    const mustInject = this.injections.filter((injection) => {
      return html.match(`<!-- ${injection.tag} -->`) === null;
    });

    if (mustInject.length) {
      const template = this.hbs?.compile(
        mustInject.reduce(
          (injectedHtml, injection) =>
            this.injectScripts(injectedHtml, injection),
          html
        )
      );

      if (template) {
        return template({});
      }

      return "";
    }

    return html;
  }

  private injectScripts(html: string, injection: InjectionData): string {
    const targetTag = this.findTargetTag(html, injection);

    logger.debug(`-- Injecting {{> ${injection.tag}}}`);

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
