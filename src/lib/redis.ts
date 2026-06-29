// Redis singleton (cache + rate limiting). Lazy-connects so the app can boot
// even if Redis is briefly unavailable; callers should handle failures gracefully.
import Redis from "ioredis";
import { env } from "./env";

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
};

export const redis =
  globalForRedis.redis ??
  new Redis(env.REDIS_URL, {
    lazyConnect: true,
    maxRetriesPerRequest: 2,
    // Don't let a Redis outage hang the request indefinitely.
    enableOfflineQueue: false,
  });

redis.on("error", (err) => {
  // Cache/rate-limit are best-effort; log but never crash the request path.
  console.warn("[redis] connection error:", err.message);
});

if (process.env.NODE_ENV !== "production") {
  globalForRedis.redis = redis;
}
