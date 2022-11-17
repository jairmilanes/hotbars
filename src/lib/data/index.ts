import { QueryBuilder } from "./adaptor/query-builder";

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
    const connector = await import(`./adaptor/${name}.adaptor`);

    return this.register(name, new connector.default(...args));
  }

  static get(name?: string): QueryBuilder {
    if (name && name in this.instances) {
      return this.instances[name];
    }

    if (this.default) {
      return this.instances[this.default];
    }

    throw new Error(
      `Data adapter "${name}" nor the default has not been registered, currently registered are ${Object.keys(
        this.instances
      ).join(",")}.`
    );
  }

  static setDefault(name: string): void {
    this.default = name;
  }
}
