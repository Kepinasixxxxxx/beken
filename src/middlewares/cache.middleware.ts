import { Request, Response, NextFunction } from 'express';
import { RedisService } from '../shared/services/redis.service';

/**
 * Express Middleware for auto-caching GET HTTP responses in Redis
 * @param ttlSeconds Cache duration in seconds (default 1 hour)
 */
export const cacheMiddleware = (ttlSeconds: number = 3600) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const cacheKey = `http_cache:${req.originalUrl}`;
    const cachedData = await RedisService.get(cacheKey);

    if (cachedData) {
      res.setHeader('X-Cache', 'HIT');
      return res.json(cachedData);
    }

    res.setHeader('X-Cache', 'MISS');

    // Intercept res.json to cache response body
    const originalJson = res.json.bind(res);
    res.json = (body: any) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        RedisService.set(cacheKey, body, ttlSeconds).catch((err) =>
          console.error(`[Cache Middleware SET Error] key=${cacheKey}:`, err)
        );
      }
      return originalJson(body);
    };

    next();
  };
};
