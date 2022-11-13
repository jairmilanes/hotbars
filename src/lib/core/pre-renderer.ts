import glob from "glob";
import { Config } from "./config";
import prettier from "prettier";
import uglify from "uglify-js";
import { HandlebarsException } from "../exeptions/handlebars.exception";
import { logger, configureHandlebars } from "../services";
import { loadTemplate } from "../utils";
import { HandlebarsWax } from "../../types";

export class PreRenderer {
  private hbs?: HandlebarsWax;

  private template = `
    (function() {
        Handlebars.templates = {};
        Handlebars.partials = {};

        {PARTIALS}
        {TEMPLATES}
    })();
  `;

  private _template = this.template;

  private prod = Config.get("env") === "production";

  configure(): void {
    const { instance, error } = configureHandlebars();

    if ((error || !instance) && !this.hbs) {
      throw new HandlebarsException("Failed to initialize Handlebars", error);
    }

    if (instance) {
      this.hbs = instance;
    }
  }

  async preRender(isSystem: boolean): Promise<string> {
    this._template = this.template;

    try {
      const partials = this.resolvePartials(isSystem);
      const templates = this.resolveTemplates(isSystem);

      if (!partials.length) {
        this.update(
          "{PARTIALS}",
          `console.warn("No shared partials found in ${this.getTemplatesPath(
            isSystem
          )}");`
        );
      }

      if (!templates.length) {
        this.update(
          "{TEMPLATES}",
          `console.warn("No templates found in ${this.getTemplatesPath(
            isSystem
          )}");`
        );
      }

      if (!partials.length && !templates.length) {
        return this._template;
      }

      await this.preCompile(partials, "partials");
      await this.preCompile(templates, "templates");

      if (!this.prod) {
        return this.prettify();
      }

      return this.uglyfy();
    } catch (err) {
      return `console.error("${(err as Error).message}");`;
    }
  }

  private update(key: string, value: string) {
    this._template = this._template.replace(key, value);
  }

  private getTemplatesPath(isSystem?: boolean): string[] {
    return isSystem
      ? [
          Config.fullGlobPath("serverShared", "hbs"),
          Config.fullGlobPath("serverPrecompile", "hbs"),
        ]
      : [Config.fullGlobPath("precompile"), Config.fullGlobPath("shared")];
  }

  private resolve(path: string): string[] {
    return glob.sync(path, {
      nodir: true,
      cwd: Config.get("root"),
    });
  }

  private resolveTemplates(isSystem?: boolean) {
    const path = isSystem
      ? Config.fullGlobPath("serverPrecompile", "hbs")
      : Config.fullGlobPath("precompile");

    return this.resolve(path);
  }

  private resolvePartials(isSystem?: boolean) {
    const path = isSystem
      ? Config.fullGlobPath("serverShared", "hbs")
      : Config.fullGlobPath("shared");

    return this.resolve(path);
  }

  private async preCompile(paths: string[], key: string): Promise<void> {
    try {
      const allCode = this.compileAll(await this.loadAll(paths), key);

      this.update(`{${key.toUpperCase()}}`, allCode.join("\r\n"));
    } catch (err) {
      this.update(
        `{${key.toUpperCase()}}`,
        `console.warn("${(err as Error).message}");`
      );
    }
  }

  private compileAll(
    templates: { name: string; template: string }[],
    key: string
  ): string[] {
    return templates.map(({ name, template }) => {
      const code = this.hbs?.handlebars.precompile(template);
      return `Handlebars.${key.toLowerCase()}["${name}"] = Handlebars.template(${code});`;
    });
  }

  private loadAll(
    templates: string[]
  ): Promise<{ name: string; template: string }[]> {
    return Promise.all(
      templates.map((path) => loadTemplate(path, Config.get("encoding")))
    );
  }

  private prettify(): string {
    return prettier.format(this._template, {
      parser: "babel",
    });
  }

  private uglyfy(): string {
    const ugly = uglify.minify(this._template);

    if (ugly.error) {
      logger.warn("-- Error trying to uglify pre-compiled output.");
      return this._template;
    }

    return ugly.code;
  }
}
