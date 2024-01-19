import { Config } from "../../core";

export type App = Record<string, any>

export type Envs = {
  local?: App;
  development?: App;
  test?: App;
  production?: App;
}

export type Status = {
  envs: App[];
  loaded: boolean;
  messages: string[];
}

export abstract class EnvConnector {

  envs: Envs = {
    local: {
      "archived_at": null,
      "buildpack_provided_description": "NodeJS",
      "build_stack": null,
      "created_at": Date.now(),
      "id": "1",
      "git_url": null,
      "maintenance": false,
      "name": "local",
      "owner": {
        "email": "system",
        "id": "1"
      },
      "region": {
        "id": "1",
        "name": "local"
      },
      "organization": null,
      "space": null,
      "released_at": Date.now(),
      "repo_size": 0,
      "slug_size": null,
      "stack": {
        "id": null,
        "name": null
      },
      "updated_at": Date.now(),
      "web_url": `http://127.0.0.1:${Config.get("port")}/`
    },
    development: undefined,
    test: undefined,
    production: undefined
  }

  loaded = false

  messages: string[] = []

  abstract load(): Promise<Envs|void>;

  abstract init(): Promise<void>;

  abstract create(name: string): Promise<App|null>;

  abstract sync(envName: keyof Envs): Promise<App|null>;

  abstract notify(resource: string, action: string, app: App): Promise<App|null>;

  abstract status(): Promise<Status>;

  protected env(name: string) {
    return `hb-${name}`;
  }
}