import { createClient, RedisClientType } from '@redis/client';
import { logger } from "../../../services";
import { Config } from "../../core";
import { CacheInterface } from "../../interfaces/cache.interface";

export class RedisCache implements CacheInterface {

  client?: RedisClientType;

  constructor() {
    const host = Config.get("cache.host")
    const port = Config.get("cache.port")

    const url = host && port ? `redis://${host}:${port}` : undefined;

    logger.debug("%p%P %s", 1, 1, url)

    if (Config.enabled("cache")) {
      this.client = createClient({
        url
      })

      this.client
        .on('error', err => {
          logger.error('Redis Client Error:')
          logger.error(err)
        })
    }
  }

  async init() {
    await this.client?.connect();
  }

  async destroy() {
    await this.client?.disconnect();
  }

  get(key: string): Promise<any> {
    return this.client?.get(key) as any;
  }

  async set(key: string, value: any) {
    await this.client?.setEx(
      key,
      Config.get<number>("cache.expire"),
      value
    );
  }
}