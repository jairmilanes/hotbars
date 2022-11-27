import { QueryBuilder } from "./adaptor/query-builder";
import {
  DataAdapterNotFoundException,
  UnregistredDataAdapterException,
} from "../exceptions";
import { logger } from "../../services";

export * from "./adaptor/query-builder";

export class DataManager {
  private static instances: { [provider: string]: QueryBuilder } = {};

  private static default?: string;

  static register(name: string, instance: QueryBuilder): QueryBuilder {
    if (instance instanceof QueryBuilder) {
      this.instances[name] = instance;

      if (!this.default) this.setDefault(name);

      return instance;
    }

    throw new Error("Data adapter must extend QueryBuilder.");
  }

  static async create(name: string, ...args: unknown[]): Promise<QueryBuilder> {
    logger.info("%p%P Data Manager", 1, 1);
    const path = `./adaptor/${name}.adaptor`;

    try {
      const connector = await import(path);
      logger.debug("%p%P registering Json DB...", 3, 0);
      return this.register(name, new connector.default(...args));
    } catch (e) {
      throw new DataAdapterNotFoundException(name, path, e as Error);
    }
  }

  static get(name?: string): QueryBuilder {
    if (name && name in this.instances) {
      return this.instances[name];
    }

    if (this.default) {
      return this.instances[this.default];
    }

    throw new UnregistredDataAdapterException(name);
  }

  static setDefault(name: string): void {
    this.default = name;
  }
}
