import Heroku from 'heroku-client'
import { set, has } from "lodash"
import { Env } from "../../types";
import { logger } from "../../../services";
import { App, EnvConnector, Envs, Status } from "./connector";


export class HerokuApi extends EnvConnector {
  api: Heroku;

  constructor() {
    super();

    this.api = new Heroku({
      token: process.env.HEROKU_API_KEY,
      debug: false,
      debugHeaders: undefined, //"Accept"
    })
  }

  async load() {
    logger.debug("%p%P Environments", 1, 1)

    if (this.loaded) {
      logger.debug("%p%P environments already loaded.", 3, 0)
      return;
    }

    try {
      const apps = await this.api.get("/apps", { cache: undefined })

      logger.debug("%p%P %s apps found:", 3, 0, apps.length)

      apps.map((app: App) => {
        if ([this.env(Env.Dev), this.env(Env.Test), this.env(Env.Prod)].indexOf(app.name) > -1) {
          logger.debug(`%p%P App "%s" found!`, 5, 1, app.name.substring(3))
          this.envs[app.name.substring(3) as keyof Envs] = app
        }
      })

      await this.getDynos(Env.Dev)
      await this.getDynos(Env.Test)
      await this.getDynos(Env.Prod)
      await this.getHooks(Env.Dev)
      await this.getHooks(Env.Test)
      await this.getHooks(Env.Prod)

      logger.debug("%p%P Environments loaded!", 3, 1)
      return this.envs
    } catch(e) {
      logger.error("%p%P Heroku error", 3, 0)
      logger.error(e)
    }
  }

  async init() {
    logger.info("Creating Heroku environments...")

    await this.create(Env.Dev)
    await this.create(Env.Test)
    await this.create(Env.Prod)
  }

  async create(envName: keyof Envs) {
    if (this.envs[envName]) {
      logger.debug("%p%P %s already exists. ", 3, 1, envName);
      return this.envs[envName as keyof Envs] as App;
    }

    try {
      logger.debug("%p%P Creating %s", 3, 1, envName)

      this.envs[envName] = await this.api
        .post('/apps', { body: { name: this.env(envName) } })

      if (has(this.envs, envName)) {
        set(this.envs[envName] || {}, "dynos", [])
        set(this.envs[envName] || {}, "hooks", [])
      }

      await this.sync(envName)

      logger.debug("%p%P %s created!", 5, 0, envName)
      return this.envs[envName as keyof Envs] as App
    } catch(e) {
      logger.error(e)
      return null
    }
  }

  async sync(envName: keyof Envs) {
    let hooks: any[] = []

    if (this.envs[envName]) {
      try {
        logger.debug("%p%P Syncing Webhooks", 3, 1)

        hooks = await this.api
          .post(
            `/apps/${this.env(envName)}/webhooks`,
            { body: { include: ["api:app"], level: "notify", url: "https://example.com/notify" } }
          );
      } catch (e) {
        const err = e as any
        logger.error(err.statusCode)
        logger.error(err.body)
        logger.error(err)
      }
    }

    (this.envs[envName] || {}).hooks = hooks

    return hooks
  }

  async notify(resource: string, action: string, app: App) {
    if (resource === "app") {
      if (action === "remove") {
        this.envs[app.name.replace("hb-", "") as keyof Envs] = undefined
      }
    }

    return app
  }

  async getHooks(envName: keyof Envs) {
    let hooks = []

    if (this.envs[envName]) {
      try {
        hooks = await this.api.get(`/apps/${this.env(envName)}/webhooks`)
        logger.debug(hooks)
        hooks = hooks.filter((hook: any) => hook.include.indexOf("api:app") > -1)

        logger.debug("%p%P %s Webhooks %o", 3, 0, envName, hooks)
      } catch(e) {
        const err = e as any

        if (err.statusCode === 404) {
          logger.error(`%p%P %s webhook %s`, 3, 0, envName, err.body.message)
        } else {
          logger.error(err)
        }
      }
    }

    (this.envs[envName] || {}).hooks = hooks

    return hooks
  }

  async getDynos(envName: keyof Envs) {
    let dynos = []

    if (this.envs[envName]) {
      try {
        dynos = await this.api.get(`/apps/${this.env(envName)}/dynos`);
        logger.debug("%p%P %s Dynos %o", 3, 0, envName, dynos)
      } catch(e) {
        const err = e as any

        if (err.statusCode === 404) {
          logger.error(`%p%P %s dynos %s`, 3, 0, envName, err.body.message)
        } else {
          logger.error(err)
        }
      }
    }

    (this.envs[envName] || {}).dynos = dynos

    return dynos
  }

  async status() {
    return {
      envs: this.envs,
      loaded: this.loaded,
      messages: this.messages
    } as Status;
  }

  deploy() {
    return;
  }

  private check() {
    if (!process.env.HEROKU_API_KEY) throw new Error("Must configure your \"HEROKU_API_TOKEN\" environment variable.")
  }
}