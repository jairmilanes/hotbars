import { FileCache } from "./file.cache"
import { RedisCache } from "./redis.cache"
import { CacheInterface } from "../../interfaces/cache.interface";

export const getCache = (type: string): CacheInterface => {
  switch(type) {
    case "redis":
      return new RedisCache();
    default:
      return new FileCache();
  }
}
