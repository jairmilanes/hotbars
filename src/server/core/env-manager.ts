import { EnvConnector, EnvConnectors, getConnector } from "../services";
import { logger } from "../../services";

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
    logger.debug(`Environments manager`);
    this.instance = new EnvManager(connector)
    logger.silly("%p%P %s", 1, 1, connector)
    return this
  }

  static get(name?: keyof EnvConnectors) {
    if (!name) return this.instance.default
    return getConnector(name);
  }

  create() {
    return null;
  }

  static load(name?: keyof EnvConnectors) {
    logger.info("Environments...")
    if (!name) return this.instance.default.load();
    return getConnector(name).load();
  }
}