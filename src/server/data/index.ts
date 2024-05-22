import { QueryBuilder } from "./adaptor/query-builder";
import {
  DataAdapterNotFoundException,
  UnregistredDataAdapterException,
} from "../exceptions";
import { logger } from "../../services";
import glob from "glob";
import { readJson } from "fs-extra";
import { isObject } from "lodash";
import { joinPath, resolvePath } from "../utils";

export * from "./adaptor/query-builder";

export class DataManager {
  private static instances: { [provider: string]: QueryBuilder } = {};

  private static default?: string;

  static register<T extends QueryBuilder>(name: string, instance: T): T {
    logger.silly("%p%P registering %s...", 1, 1, name);

    if (instance instanceof QueryBuilder) {
      this.instances[name] = instance;

      // The mails json db should never be a default
      if (!this.default && name !== "smtpDb") {
        this.setDefault(name);
      }

      return instance;
    }

    throw new Error("Data adapter must extend QueryBuilder.");
  }

  static async create(name: string, ...args: unknown[]): Promise<QueryBuilder> {
    logger.info("Data Manager");
    const path = `./adaptor/${name}.adaptor`;

    try {
      const connector = await import(path);
      const adaptor = this.register(name, new connector.default(...args));

      await this.seed(adaptor)

      return adaptor;
    } catch (e) {
      throw new DataAdapterNotFoundException(name, path, e as Error);
    }
  }

  static async seed(adaptor: QueryBuilder) {
    const files = glob.sync(
      joinPath(resolvePath(__dirname, "seed"), "**", "*.json")
    )

    logger.debug("%p%P Loading seed files", 3, 0)
    for (let i = 0; i < files.length; i++) {
      logger.silly("%p%P %s", 5, 1, files[i])
      const name = files[i].split("/").pop()?.replace(".json", "")
      if (name) {
        const exists = await adaptor.hasCollection(name)
        if (!exists) {
          const data = await readJson(files[i])
          await adaptor.createCollection(name)

          if (Array.isArray(data)) {
            for (let c = 0; c < data.length; c++) {
              await adaptor.from(name).insert(data[c])
            }
          }

          if (isObject(data)) {
            await adaptor.set(name, data)
          }
        }
      }
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

  static getDefault(): string | undefined {
    return this.default;
  }

  static setDefault(name: string): void {
    this.default = name;
  }
}
