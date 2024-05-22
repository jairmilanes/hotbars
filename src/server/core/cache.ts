import { logger } from "../../services";
import { Config } from "./config";
import { getCache } from "../services/cache"
import { CacheInterface } from "../interfaces/cache.interface";


export class Cache {

  static instance: Cache;
  client?: CacheInterface;

  private constructor() {
    if (Config.enabled("cache")) {
      const type = Config.get<string>("cache.type")
      this.client = getCache(type)
    }
  }

  static async create() {
    logger.debug("Cache")
    this.instance = new Cache()

    if (Config.enabled("cache")) {
      await this.instance.client?.init()
    }
  }

  static async destroy() {
    await this.instance.client?.destroy();
  }

  static async get(key: string) {
    return this.instance.client?.get(key);
  }

  static async set(key: string, value: any) {
    return this.instance.client?.set(
      key,
      value
    );
  }
}
