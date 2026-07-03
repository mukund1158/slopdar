// IndexNow (indexnow.org) — instantly notify Bing/Yandex when a page is
// created or updated instead of waiting for a crawl. Ownership is proven via
// the key file served at /indexnow.txt (see src/app/indexnow.txt/route.ts).
import { env } from "@/lib/env";

const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";

/**
 * Submit site-relative paths (e.g. "/r/example.com") to IndexNow.
 * Fire-and-forget: never throws, never blocks the caller — a failed ping
 * only delays discovery, it must not fail a user-facing check.
 * No-op when INDEXNOW_KEY is unset (local dev) or APP_URL isn't public https.
 */
export function submitToIndexNow(paths: string[]): void {
  if (!env.INDEXNOW_KEY || paths.length === 0) return;

  const base = new URL(env.APP_URL);
  // Search engines can only verify a public https host; skip localhost/dev.
  if (base.protocol !== "https:") return;

  const body = {
    host: base.host,
    key: env.INDEXNOW_KEY,
    keyLocation: `${base.origin}/indexnow.txt`,
    urlList: paths.map((p) => new URL(p, base.origin).toString()),
  };

  void fetch(INDEXNOW_ENDPOINT, {
    method: "POST",
    headers: { "content-type": "application/json; charset=utf-8" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(10_000),
  })
    .then((res) => {
      // 200/202 = accepted. Anything else usually means a key/URL mismatch —
      // worth surfacing in logs, but never an error for the user.
      if (res.status !== 200 && res.status !== 202) {
        console.warn(`IndexNow ping rejected (HTTP ${res.status}) for: ${body.urlList.join(", ")}`);
      }
    })
    .catch((err) => {
      console.warn("IndexNow ping failed:", err instanceof Error ? err.message : err);
    });
}
