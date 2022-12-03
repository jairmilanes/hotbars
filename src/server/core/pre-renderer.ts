import * as _ from "lodash";
import glob from "glob";
import prettier from "prettier";
import uglify from "uglify-js";
import { Env, HandlebarsWax, WatcherChange } from "../types";
import { logger } from "../../services";
import { configureHandlebars } from "../services";
import { HandlebarsException } from "../exceptions";
import { loadTemplate } from "../utils";
import { Config, DashboardConfig } from "../core";
import { EventManager, ServerEvent } from "./event-manager";

interface TemplateDefintion {
  name: string;
  template: string;
}

export class PreRenderer {
  private static instance: PreRenderer;

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

  private prod = Config.get("env") === Env.Prod;

  static create(): void {
    logger.debug(`%p%P Pre-renderer`, 1, 1);
    this.instance = new PreRenderer();

    EventManager.i.on(
      ServerEvent.PRE_COMPILED_CHANGED,
      this.instance.configure.bind(this)
    );

    this.instance.configure();
  }

  static async preRender(isSystem: boolean): Promise<string> {
    this.instance._template = this.instance.template;

    try {
      const partials = this.instance.resolvePartials(isSystem);
      const templates = this.instance.resolveTemplates(isSystem);

      if (!partials.length) {
        this.instance.update(
          "{PARTIALS}",
          `console.warn("No shared partials found in ${this.instance.getTemplatesPath(
            isSystem
          )}");`
        );
      }

      if (!templates.length) {
        this.instance.update(
          "{TEMPLATES}",
          `console.warn("No templates found in ${this.instance.getTemplatesPath(
            isSystem
          )}");`
        );
      }

      if (!partials.length && !templates.length) {
        return this.instance._template;
      }

      await this.instance.preCompile(partials, "partials");
      await this.instance.preCompile(templates, "templates");

      if (!this.instance.prod) {
        return this.instance.prettify();
      }

      return this.instance.uglyfy();
    } catch (err) {
      return `console.error("${(err as Error).message}");`;
    }
  }

  private configure(data?: WatcherChange): void {
    const { instance, error } = configureHandlebars();

    if ((error || !instance) && !this.hbs) {
      throw new HandlebarsException("Failed to initialize Handlebars", error);
    }

    if (instance) {
      this.hbs = instance;
    }

    if (data) {
      EventManager.i.emit(ServerEvent.HOT_RELOAD, data);
    }
  }

  private update(key: string, value: string) {
    this._template = this._template.replace(key, value);
  }

  private getTemplatesPath(isSystem?: boolean): string[] {
    return isSystem
      ? [
          DashboardConfig.fullGlobPath("shared"),
          DashboardConfig.fullGlobPath("precompile"),
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
      ? DashboardConfig.fullGlobPath("precompile")
      : Config.fullGlobPath("precompile");

    return this.resolve(path);
  }

  private resolvePartials(isSystem?: boolean) {
    const path = isSystem
      ? DashboardConfig.fullGlobPath("shared")
      : Config.fullGlobPath("shared");

    return this.resolve(path);
  }

  private async preCompile(paths: string[], key: string): Promise<void> {
    try {
      const templates = await this.loadAll(paths);
      const allCode = this.compileAll(templates, key);

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

  private loadAll(templates: string[]): Promise<TemplateDefintion[]> {
    return Promise.all(
      templates.map((path) => loadTemplate(path, Config.get("encoding")))
    ).then(
      (templates) => _.filter(templates, _.isPlainObject) as TemplateDefintion[]
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
