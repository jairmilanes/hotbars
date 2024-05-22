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
import * as htmlfy from "htmlfy";

interface TemplateDefintion {
  name: string;
  template: string;
}


export class PreRenderer {
  private static instance: PreRenderer;

  private hbs?: HandlebarsWax;

  private template = `
    (function() {
        Handlebars.partials = {
          ...(Handlebars.partials || {})
        };

        {SHARED}
        {DASH_SHARED}
    })();
  `;

  private _template = this.template;

  private prod = Config.get("env") === Env.Prod;

  static create(): void {
    logger.debug(`Pre-renderer`);
    this.instance = new PreRenderer();

    EventManager.i.on(ServerEvent.PRE_COMPILED_CHANGED, this.instance.configure.bind(this));
    EventManager.i.on(ServerEvent.USER_RUNTIME_CHANGED, this.instance.configure.bind(this));
    EventManager.i.on(ServerEvent.DASHBOARD_RUNTIME_CHANGED, this.instance.configure.bind(this));

    this.instance.configure();
  }

  static async preRender(isSystem: boolean): Promise<string> {
    this.instance._template = this.instance.template;

    try {
      await this.instance.loadFromServer(isSystem)

      if (this.instance.prod) {
        return this.instance.uglyfy();
      }

      return this.instance.prettify();
    } catch (err) {
      logger.error(err)
      throw err
    }
  }

  private async loadPartial(definition: TemplateDefintion, paths: TemplateDefintion[]): Promise<TemplateDefintion | null> {
    logger.debug(`Pre-Rendering partial %s`, definition.template.replace(process.cwd(), ""));

    try {
      const { template } =
      (await loadTemplate(definition.template, Config.get("encoding"), definition.name)) || {};

      definition.template = template

      return definition
    } catch(e) {
      if (!paths.length) {
        return null
      }

      return this.loadPartial(paths.shift() as TemplateDefintion, paths)
    }
  }

  static async preload(templates: string[]) {
    const codeTemplates: Record<string, any> = {}

    for (let i = 0; i < templates.length; i++) {
      const name = templates[i]
      const paths: TemplateDefintion[] = [
        { name: name, template: Config.fullPath("partials", name, `.${Config.get("extname")}`) },
        // { name: name, template: Config.fullPath("shared", name, `.${Config.get("extname")}`) },
        { name: name, template: DashboardConfig.fullPath("partials", name, `.${Config.get("extname")}`) },
        // { name: name, template: DashboardConfig.fullPath("shared", name, `.${Config.get("extname")}`) },
      ]

      const template = await this.instance.loadPartial(
        paths.shift() as TemplateDefintion,
        paths
      )

      if (template) {
        logger.debug("--template found")
        codeTemplates[template.name] = this.instance.hbs?.handlebars.precompile(template.template);
        logger.debug("--format", typeof codeTemplates[template.name])
      }
    }

    return codeTemplates
  }

  private async loadFromServer(isSystem: boolean) {
    const templates: Record<string, string[] | null> = {
      shared: this.resolveShared(isSystem),
      // Load dashboard shared folder into the users precompiled
      dashShared: !isSystem ? this.resolveShared(true) : null
    }

    _.map(_.keys(templates), (key, i) => {
      if (!templates[key]?.length) {
        this.update(
          `{${_.toUpper(_.snakeCase(key))}}`,
          `console.warn("No shared ${key} found in ${this.getTemplatesPath(
            isSystem
          )}");`
        );
      }
    })

    const { shared, dashShared} = templates;

    if (!shared?.length && (!dashShared || !!dashShared?.length)) {
      return "";
    }

    const keys = _.keys(templates)

    await keys.reduce((ac: Promise<void>, key: string) => {
        return ac.then(() =>
          this.loadAll(key, templates[key] || [])
            .then(items =>
                this.preCompile(items, key)
            )
        )
      }, Promise.resolve())
  }

  private configure(data?: WatcherChange): void {
    if (!data) {
      logger.silly(`%p%P Configuring pre-renderer...`, 1, 1);
    } else {
      logger.silly(`%p%P Re-configuring pre-renderer...`, 1, 1);
    }

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
      ? [DashboardConfig.fullGlobPath("shared"),]
      : [Config.fullGlobPath("shared")];
  }

  private resolve(path: string): string[] {
    return glob.sync(path, {
      nodir: true,
      cwd: Config.get("root"),
    });
  }

  private resolveShared(isSystem?: boolean) {
    const path = isSystem
      ? DashboardConfig.fullGlobPath("shared")
      : Config.fullGlobPath("shared");

    return this.resolve(path);
  }

  private async preCompile(templates: TemplateDefintion[], key: string): Promise<void> {
    try {
      const allCode = this.compileAll(templates);
      this.update(`{${_.toUpper(_.snakeCase(key))}}`, allCode.join("\r\n"));
    } catch (err) {
      this.update(
        `{${_.toUpper(_.snakeCase(key))}}`,
        `console.warn("${(err as Error).message}");`
      );
    }
  }

  private compileAll(
    templates: { name: string; template: string }[]
  ): string[] {
    return templates.map(({ name, template }) => {
      const code = this.hbs?.handlebars.precompile(template);
      return `Handlebars.partials["${name}"] = Handlebars.template(${code});`;
    });
  }

  private loadAll(key: string, templates: string[]): Promise<TemplateDefintion[]> {
    return Promise.all(
      templates.map((path) => loadTemplate(path, Config.get("encoding"), key))
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
