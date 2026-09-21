import { redis, getRedisStatus } from '../../config/redis';

// Replacer & reviver to safely handle Prisma BigInt in JSON serialization
const bigIntReplacer = (_key: string, value: any) => {
  if (typeof value === 'bigint') {
    return { __type: 'BigInt', value: value.toString() };
  }
  return value;
};

const bigIntReviver = (_key: string, value: any) => {
  if (value && typeof value === 'object' && value.__type === 'BigInt') {
    return BigInt(value.value);
  }
  return value;
};

export class RedisService {
  /**
   * Get cached item by key
   */
  static async get<T>(key: string): Promise<T | null> {
    if (!getRedisStatus()) return null;
    try {
      const data = await redis.get(key);
      if (!data) return null;
      return JSON.parse(data, bigIntReviver) as T;
    } catch (error) {
      console.error(`[RedisService GET Error] key=${key}:`, error);
      return null;
    }
  }

  /**
   * Set cache item with optional TTL (default 3600s / 1 hour)
   */
  static async set(key: string, value: any, ttlSeconds: number = 3600): Promise<boolean> {
    if (!getRedisStatus()) return false;
    try {
      const serialized = JSON.stringify(value, bigIntReplacer);
      if (ttlSeconds > 0) {
        await redis.set(key, serialized, 'EX', ttlSeconds);
      } else {
        await redis.set(key, serialized);
      }
      return true;
    } catch (error) {
      console.error(`[RedisService SET Error] key=${key}:`, error);
      return false;
    }
  }

  /**
   * Delete specific key or array of keys
   */
  static async del(key: string | string[]): Promise<number> {
    if (!getRedisStatus()) return 0;
    try {
      const keys = Array.isArray(key) ? key : [key];
      if (keys.length === 0) return 0;
      return await redis.del(...keys);
    } catch (error) {
      console.error(`[RedisService DEL Error] key=${key}:`, error);
      return 0;
    }
  }

  /**
   * Delete all keys matching a pattern (e.g. "products:*")
   */
  static async delPattern(pattern: string): Promise<number> {
    if (!getRedisStatus()) return 0;
    try {
      let cursor = '0';
      let deletedCount = 0;
      do {
        const [nextCursor, keys] = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
        cursor = nextCursor;
        if (keys.length > 0) {
          const deleted = await redis.del(...keys);
          deletedCount += deleted;
        }
      } while (cursor !== '0');
      return deletedCount;
    } catch (error) {
      console.error(`[RedisService delPattern Error] pattern=${pattern}:`, error);
      return 0;
    }
  }

  /**
   * Flush all keys in the current Redis database
   */
  static async flush(): Promise<boolean> {
    if (!getRedisStatus()) return false;
    try {
      await redis.flushdb();
      return true;
    } catch (error) {
      console.error('[RedisService FLUSH Error]:', error);
      return false;
    }
  }
}
