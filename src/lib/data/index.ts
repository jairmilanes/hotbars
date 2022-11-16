import { QueryBuilder } from "./adaptor/query-builder";

export class DataManager {
  private static instances: { [provider: string]: QueryBuilder } = {};

  static register(name: string, instance: QueryBuilder): QueryBuilder {
    if (instance instanceof QueryBuilder) {
      this.instances[name] = instance;

      return instance;
    }

    throw new Error("Data adapter must extend QueryBuilder.");
  }

  static async create(name: string, ...args: unknown[]): Promise<QueryBuilder> {
    const connector = await import(`./adaptor/${name}.adaptor`);

    return this.register(name, new connector.default(...args));
  }

  static get(name: string): QueryBuilder {
    if (name in this.instances) {
      return this.instances[name];
    }

    throw new Error(
      `Data adapter "${name}" has not been registered, currently registered are ${Object.keys(
        this.instances
      ).join(",")}.`
    );
  }
}
