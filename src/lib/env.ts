// Centralised, validated environment access. Import `env` everywhere instead of
// reading process.env directly so a missing/malformed var fails loudly at startup.
import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  APP_URL: z.string().url().default("http://localhost:3000"),

  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  REDIS_URL: z.string().default("redis://localhost:6379"),

  SCAN_FETCH_TIMEOUT_MS: z.coerce.number().int().positive().default(10_000),
  SCAN_MAX_BYTES: z.coerce.number().int().positive().default(3_000_000),
  SCAN_MAX_REDIRECTS: z.coerce.number().int().min(0).max(20).default(5),
  SCAN_CACHE_TTL_SECONDS: z.coerce.number().int().positive().default(86_400),
  SCAN_USER_AGENT: z
    .string()
    .default("SlopdarBot/0.1 (+https://slopdar.com/bot)"),

  RATE_LIMIT_WINDOW_SECONDS: z.coerce.number().int().positive().default(60),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().positive().default(10),

  SCREENSHOT_DIR: z.string().default("./public/screenshots"),
  SCREENSHOT_TIMEOUT_MS: z.coerce.number().int().positive().default(15_000),
  SCREENSHOT_WIDTH: z.coerce.number().int().positive().default(1280),
  SCREENSHOT_HEIGHT: z.coerce.number().int().positive().default(800),

  // IndexNow key for instant Bing/Yandex indexing pings. Optional — when
  // unset, key-file route 404s and pings are silently skipped (e.g. local dev).
  INDEXNOW_KEY: z
    .string()
    .min(8)
    .max(128)
    .regex(/^[A-Za-z0-9-]+$/, "IndexNow key must be 8-128 chars of a-z, A-Z, 0-9 or dashes")
    .optional(),

  // "1" allows scanning private/loopback hosts. LOCAL DEV ONLY.
  ALLOW_PRIVATE_HOSTS: z
    .enum(["0", "1"])
    .default("0")
    .transform((v) => v === "1"),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:", parsed.error.flatten().fieldErrors);
  throw new Error("Invalid environment configuration");
}

export const env = parsed.data;
