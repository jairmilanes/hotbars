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

  static register<T extends QueryBuilder>(name: string, instance: T): T {
    if (instance instanceof QueryBuilder) {
      this.instances[name] = instance;

      // The mails json db should never be a default
      if (!this.default && name !== "smtpDb") {
        this.setDefault(name)
      }

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

  static get<T extends QueryBuilder>(name?: string): T {
    if (name && name in this.instances) {
      return this.instances[name] as T;
    }

    if (this.default) {
      return this.instances[this.default] as T;
    }

    throw new UnregistredDataAdapterException(name);
  }

  static setDefault(name: string): void {
    this.default = name;
  }
}
