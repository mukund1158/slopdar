// Scoring + tier mapping. Sums the weights of matched signals into a 0–100 Slop
// Score and maps it to a tier (docs/06-scanner-logic.md).
//
// Thresholds and weights are deliberately simple placeholders — the docs flag
// these as "to be tuned against real example sites" before launch.
import type { MatchedSignal, Tier } from "./types";

export interface ScoreOutput {
  score: number;
  tier: Tier;
}

const TIERS: { max: number; tier: Tier }[] = [
  { max: 25, tier: "Hand-Crafted" },
  { max: 50, tier: "Suspiciously Clean" },
  { max: 75, tier: "Vibe-Coded" },
  { max: 100, tier: "Pure Slop" },
];

export function tierFor(score: number): Tier {
  return TIERS.find((t) => score <= t.max)?.tier ?? "Pure Slop";
}

/**
 * Drop conflicting builder fingerprints. A real site is built by at most one
 * builder, so when 2+ fingerprint rules matched on name-strings alone
 * (`weak`), the page is almost certainly *about* those tools (a comparison
 * article, a review) — discard the weak hits. Strong hits (hosting domain,
 * injected attributes, generator meta) always survive.
 */
export function dropConflictingFingerprints(signals: MatchedSignal[]): MatchedSignal[] {
  const weakFingerprints = signals.filter((s) => s.category === "fingerprint" && s.weak);
  if (weakFingerprints.length < 2) return signals;
  return signals.filter((s) => !(s.category === "fingerprint" && s.weak));
}

export function scoreSignals(signals: MatchedSignal[]): ScoreOutput {
  const raw = signals.reduce((sum, s) => sum + s.weight, 0);
  const score = Math.max(0, Math.min(100, Math.round(raw)));
  return { score, tier: tierFor(score) };
}

export const TIER_EMOJI: Record<Tier, string> = {
  "Hand-Crafted": "🛠️",
  "Suspiciously Clean": "✨",
  "Vibe-Coded": "🌊",
  "Pure Slop": "🤖",
};
