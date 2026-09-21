import Redis from 'ioredis';
import { env } from './env';

let isConnected = false;

export const redis = new Redis({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  password: env.REDIS_PASSWORD || undefined,
  db: env.REDIS_DB,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3,
  enableOfflineQueue: true,
});

redis.on('connect', () => {
  console.log('[Redis] Connecting to Redis server...');
});

redis.on('ready', () => {
  isConnected = true;
  console.log(`[Redis] Connected successfully to ${env.REDIS_HOST}:${env.REDIS_PORT}`);
});

redis.on('error', (err) => {
  isConnected = false;
  console.error('[Redis Error]', err.message);
});

redis.on('close', () => {
  isConnected = false;
});

export const getRedisStatus = () => isConnected;
