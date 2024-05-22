import { FileSystemCache } from 'file-system-cache';
import { logger } from "../../../services";
import { Config } from "../../core";
import { CacheInterface } from "../../interfaces/cache.interface";
import { getServerDataDir } from "../../utils/get-server-data-dir";

export class FileCache implements CacheInterface {

  client?: FileSystemCache;

  constructor() {
    // logger.debug("%p%P %s", 1, 1)

    if (Config.enabled("cache")) {
      this.client = new FileSystemCache({
        basePath: getServerDataDir(".cache"), // (optional) Path where cache files are stored (default).
        ns: "core",   // (optional) A grouping namespace for items.
        hash: "sha1",         // (optional) A hashing algorithm used within the cache key.
        ttl: 60               // (optional) A time-to-live (in secs) on how long an item remains cached.
      });
    }
  }

  async init() {
    return;
  }

  async destroy() {
    // await this.client?.disconnect();
  }

  get(key: string): Promise<any> {
    return this.client?.get(key) as any;
  }

  async set(key: string, value: any) {
    await this.client?.set(
      key,
      value,
      Config.get<number>("cache.expire"),
    );
  }
}