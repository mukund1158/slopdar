// Fixed-window per-key rate limiting backed by Redis. Best-effort: if Redis is
// unavailable the request is allowed (we never block legitimate traffic on a
// cache outage), but the failure is logged.
import { redis } from "@/lib/redis";
import { env } from "@/lib/env";

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetSeconds: number;
}

export async function rateLimit(key: string): Promise<RateLimitResult> {
  const windowSec = env.RATE_LIMIT_WINDOW_SECONDS;
  const max = env.RATE_LIMIT_MAX_REQUESTS;
  const redisKey = `ratelimit:${key}`;

  try {
    const count = await redis.incr(redisKey);
    if (count === 1) {
      await redis.expire(redisKey, windowSec);
    }
    const ttl = await redis.ttl(redisKey);
    return {
      allowed: count <= max,
      remaining: Math.max(0, max - count),
      resetSeconds: ttl > 0 ? ttl : windowSec,
    };
  } catch (err) {
    console.warn("[rate-limit] redis unavailable, allowing request:", err);
    return { allowed: true, remaining: max, resetSeconds: windowSec };
  }
}

/** Best-effort client IP from proxy headers (Caddy/Nginx set these). */
export function clientIp(headers: Headers): string {
  const fwd = headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return headers.get("x-real-ip")?.trim() || "unknown";
}
