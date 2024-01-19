import { EnvConnector, EnvConnectors, getConnector } from "../services";

export { EnvConnector, EnvConnectors } from "../services/deployment";

export class EnvManager {

  default: EnvConnector;

  static instance: EnvManager;

  private constructor(connectorName: string) {
    const connector = getConnector(connectorName)

    if (!connector) {
      throw new Error(`Environment connector "${connector}" does not exist!`)
    }

    this.default = connector
  }

  static create(connector: string) {
    this.instance = new EnvManager(connector)
    return this
  }

  static get(name?: keyof EnvConnectors) {
    if (!name) return this.instance.default
    return getConnector(name);
  }

  create() {
    return null;
  }

  load() {
    return null;
  }
}