// Orchestrates a full check: cache lookup → scan → screenshot → persist → cache.
// This is the server-side workhorse behind POST /api/check.
import { createHash } from "node:crypto";
import { db } from "@/lib/db";
import { redis } from "@/lib/redis";
import { env } from "@/lib/env";
import { normalizeUrl, slugForUrl } from "@/lib/url";
import { submitToIndexNow } from "@/lib/indexnow";
import { runScan } from "@/scanner";
import { TIER_EMOJI } from "@/scanner/score";
import { captureScreenshot } from "./screenshot";
import type { Prisma } from "@prisma/client";

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

/**
 * Create a Check, keeping the slug pretty but guaranteeing uniqueness. If the
 * base slug is already taken by a *different* URL (e.g. http vs https vs www of
 * the same site), fall back to suffixing a short hash. Retries on the slug
 * unique-constraint violation (Prisma P2002).
 */
async function createCheck(
  data: Omit<Prisma.CheckCreateInput, "slug">,
  baseSlug: string,
  urlHash: string,
) {
  const candidates = [baseSlug, `${baseSlug}-${urlHash.slice(0, 6)}`, `${baseSlug}-${urlHash.slice(0, 10)}`];
  for (const slug of candidates) {
    try {
      return await db.check.create({ data: { ...data, slug } });
    } catch (err) {
      const isSlugConflict =
        typeof err === "object" &&
        err !== null &&
        (err as { code?: string }).code === "P2002" &&
        ((err as { meta?: { target?: string[] | string } }).meta?.target?.toString().includes("slug") ?? false);
      if (!isSlugConflict) throw err;
      // else: try the next, more-specific slug candidate
    }
  }
  throw new Error(`Could not generate a unique slug for ${baseSlug}`);
}

export interface CheckResponse {
  slug: string;
  url: string;
  host: string;
  score: number;
  tier: string;
  tierEmoji: string;
  screenshot: string | null;
  title: string | null;
  signals: { id: string; category: string; label: string; description: string; weight: number; evidence?: string }[];
  tech: { name: string; category?: string; confidence: number }[];
  scanError: string | null;
  scannedAt: string; // ISO timestamp of the live scan (preserved across cache hits)
  cached: boolean;
}

function cacheKey(url: string): string {
  return `check:${url}`;
}

/**
 * Run (or fetch from cache) a check for a raw user-supplied URL.
 * Throws SsrfError for blocked URLs and ScanFetchError for unreachable pages —
 * the API route maps these to appropriate HTTP statuses.
 */
export async function runCheck(rawUrl: string, opts: { force?: boolean } = {}): Promise<CheckResponse> {
  const url = normalizeUrl(rawUrl); // throws SsrfError if not a public http(s) URL
  const canonical = url.toString();
  const urlHash = sha256(canonical);
  // Pretty base slug (e.g. "stripe.com"); disambiguated below if it collides
  // with a different URL that maps to the same slug (http/https/www variants).
  const baseSlug = slugForUrl(url);

  // 1. Cache (skip on force).
  if (!opts.force) {
    try {
      const hit = await redis.get(cacheKey(canonical));
      if (hit) return { ...(JSON.parse(hit) as CheckResponse), cached: true };
    } catch {
      // cache miss / redis down — fall through to a live scan
    }
  }

  // 2. Scan (throws on SSRF or fetch failure).
  const result = await runScan(url);

  // 3. Screenshot (best-effort; never fails the check).
  const shot = await captureScreenshot(result.finalUrl);

  // 4. Persist (upsert by canonical URL; replace prior signals/tech).
  const signalsData: Prisma.SignalCreateManyCheckInput[] = result.signals.map((s) => ({
    signalId: s.id,
    category: s.category,
    label: s.label,
    description: s.description,
    weight: s.weight,
    evidence: s.evidence,
  }));
  const techData: Prisma.TechStackCreateManyCheckInput[] = result.tech.map((t) => ({
    name: t.name,
    category: t.category,
    confidence: t.confidence,
  }));

  const existing = await db.check.findUnique({ where: { urlHash }, select: { id: true } });

  let saved;
  if (existing) {
    // Re-scan of a known URL: refresh the result and replace its receipts/tech.
    saved = await db.check.update({
      where: { id: existing.id },
      data: {
        score: result.score,
        tier: result.tier,
        finalUrl: result.finalUrl,
        screenshot: shot.publicPath,
        title: result.title ?? null,
        scanError: result.fetchError ?? null,
        checkCount: { increment: 1 },
        signals: { deleteMany: {}, createMany: { data: signalsData } },
        techStacks: { deleteMany: {}, createMany: { data: techData } },
      },
    });
  } else {
    saved = await createCheck(
      {
        url: canonical,
        urlHash,
        host: result.host,
        finalUrl: result.finalUrl,
        score: result.score,
        tier: result.tier,
        screenshot: shot.publicPath,
        title: result.title ?? null,
        scanError: result.fetchError ?? null,
        signals: { createMany: { data: signalsData } },
        techStacks: { createMany: { data: techData } },
      },
      baseSlug,
      urlHash,
    );
  }

  // Tell Bing/Yandex the result page is new (or its content just changed).
  // Fire-and-forget — never blocks or fails the check.
  submitToIndexNow([`/r/${saved.slug}`]);

  const response: CheckResponse = {
    slug: saved.slug,
    url: canonical,
    host: result.host,
    score: result.score,
    tier: result.tier,
    tierEmoji: TIER_EMOJI[result.tier],
    screenshot: shot.publicPath,
    title: result.title ?? null,
    signals: result.signals,
    tech: result.tech,
    scanError: result.fetchError ?? null,
    scannedAt: saved.updatedAt.toISOString(),
    cached: false,
  };

  // 5. Cache the fresh result.
  try {
    await redis.set(cacheKey(canonical), JSON.stringify(response), "EX", env.SCAN_CACHE_TTL_SECONDS);
  } catch {
    // non-fatal
  }

  return response;
}
