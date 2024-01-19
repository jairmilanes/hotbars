import { EnvConnector } from "./connector";
import { HerokuApi } from "./heroku";

export * from "./connector";

export interface EnvConnectors {
  heroku: typeof EnvConnector;
  [name: string]: typeof EnvConnector;
}

export const getConnector = (name: keyof EnvConnectors): EnvConnector => {
  return new HerokuApi()
}