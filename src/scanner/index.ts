// Scanner orchestrator — the public entry point. Fetches a page, runs every
// signal rule, detects the tech stack, and computes the Slop Score.
//
// Pipeline (docs/05-architecture.md):
//   fetch → detect signals → detect tech → score
// (Screenshot + persistence are handled by the caller / API route.)
import * as cheerio from "cheerio";
import { fetchPage, ScanFetchError } from "./fetch";
import { ALL_SIGNALS } from "./signals";
import { detectTech } from "./techstack";
import { scoreSignals } from "./score";
import type { MatchedSignal, ScanContext, ScanResult } from "./types";

export { ScanFetchError } from "./fetch";
export { SsrfError } from "@/lib/ssrf";

export async function runScan(url: URL): Promise<ScanResult> {
  const page = await fetchPage(url);
  const $ = cheerio.load(page.html);

  const ctx: ScanContext = {
    url,
    finalUrl: page.finalUrl,
    html: page.html,
    $,
    headers: page.headers,
  };

  const signals: MatchedSignal[] = [];
  for (const rule of ALL_SIGNALS) {
    let hit;
    try {
      hit = rule.test(ctx);
    } catch (err) {
      // A single broken rule must never fail the whole scan.
      console.warn(`[scanner] rule ${rule.id} threw:`, err);
      continue;
    }
    if (hit) {
      signals.push({
        id: rule.id,
        category: rule.category,
        label: rule.label,
        description: rule.description,
        weight: rule.weight,
        evidence: hit.evidence,
      });
    }
  }

  const tech = detectTech(ctx);
  const { score, tier } = scoreSignals(signals);
  const title = $("title").first().text().trim() || undefined;

  return {
    url: url.toString(),
    finalUrl: page.finalUrl,
    host: url.hostname,
    title,
    score,
    tier,
    signals,
    tech,
  };
}

/** Convenience wrapper used by callers that prefer a never-throws result. */
export async function safeRunScan(url: URL): Promise<ScanResult> {
  try {
    return await runScan(url);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Scan failed";
    if (!(err instanceof ScanFetchError)) {
      // SSRF / unexpected errors should still surface upstream.
      throw err;
    }
    // Graceful "we couldn't read this page" result.
    return {
      url: url.toString(),
      finalUrl: url.toString(),
      host: url.hostname,
      score: 0,
      tier: "Hand-Crafted",
      signals: [],
      tech: [],
      fetchError: message,
    };
  }
}
