import frontMatter from "front-matter";
import glob from "glob";
import { readFile } from "fs/promises";
import prettify from "prettier";
import uglify from "uglify-js";
import { basename } from "../utils/path";
import { HandlebarsWax, InjectionData, SafeObject } from "../types";
import { configureHandlebars } from "./handlebars";
import { Config } from "./config";
import { logger } from "./logger";

export class Renderer {
  private readonly config: Config;

  private readonly hbs: HandlebarsWax;

  private injections: InjectionData[] = [
    {
      regex: [
        // eslint-disable-next-line no-useless-escape
        "<script.+/script>",
        "</head>",
      ],
      tag: "hhrHeaderScripts",
    },
    {
      regex: ["</body>"],
      tag: "hhrFooterScripts",
    },
  ];

  private data: SafeObject = {
    hhrHeaderScripts: [
      "https://cdn.jsdelivr.net/npm/handlebars@latest/dist/handlebars.runtime.js",
      "/precompiled",
    ],
    hhrFooterScripts: ["/hhr-scripts/socket-connector.js"],
  };

  constructor(config: Config) {
    this.config = config;
    this.hbs = configureHandlebars(this.config);
  }

  async engine(
    path: string,
    options: object,
    callback: (e: any, rendered?: string) => void
  ): Promise<void> {
    logger.debug(`-- Views path: ${path}`);

    const html = await this.render(path, options);

    callback(null, html);
  }

  async render(path: string, options: object): Promise<string> {
    const { name, template } = await this.loadTemplate(path);

    logger.debug(`-- Template name: ${name}`);

    const { attributes, body } = frontMatter(template);

    if (attributes) {
      logger.debug(`-- FrontMatter attributes:`, attributes);
    }

    const html = this.hbs.compile(body)({
      env: this.config.env,
      config: this.config as unknown as SafeObject,
      attributes: attributes as SafeObject,
      ...(options || {}),
    });

    return this.inject(html);
  }

  async preRender(): Promise<string> {
    try {
      const templates = glob.sync(this.config.precompile, {
        nodir: true,
        cwd: this.config.root,
      });

      if (templates.length) {
        const js = await this.preCompile(templates);

        if (this.config.env === "development") {
          return prettify.format(js);
        } else {
          const ugly = uglify.minify(js);

          if (ugly.error) {
            logger.warn("-- Error trying to uglify pre-compiled output.");
            return js;
          }

          return ugly.code;
        }
      }
    } catch (err: any) {
      return `console.error("${err.message}");`;
    }

    return `console.error("No templates found in ${this.config.precompile}");`;
  }

  private async preCompile(templates: string[]): Promise<string> {
    try {
      return `(function() {
            const template = Handlebars.template;
            const templates = Handlebars.templates || {};
            ${await Promise.all(
              templates.map(async (templatePath) => {
                const { name, template } = await this.loadTemplate(
                  templatePath
                );
                const code = this.hbs.handlebars.precompile(template);
                return `
                        templates["${name}"] = template(${code});\r\n
                    `;
              })
            )}
          })();`;
    } catch (err: any) {
      return `console.error("${err.message}");`;
    }
  }

  private inject(html: string): string {
    const template = this.hbs.compile(
      this.injections.reduce(
        (injectedHtml, injection) =>
          this.injectScripts(injectedHtml, injection),
        html
      )
    );

    return template(this.data);
  }

  private injectScripts(html: string, injection: InjectionData): string {
    const targetTag = this.findTargetTag(html, injection);

    logger.debug("-- Tag injected", `{{> ${injection.tag}}}`);

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

  private async loadTemplate(
    templatePath: string
  ): Promise<{ name: string; template: string }> {
    try {
      const template = await readFile(templatePath, {
        encoding: this.config.encoding,
      });
      const name = this.templateName(templatePath);
      return { name, template };
    } catch (err) {
      logger.warn(`View ${templatePath} could not be found.`);
      throw err;
    }
  }

  private templateName(templatePath: string, namespace?: string): string {
    const name = basename(templatePath, `.${this.config.extname}`);

    if (namespace) {
      return namespace + "/" + name;
    }

    return name;
  }
}
