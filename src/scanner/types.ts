// Core scanner types. Each detection rule is a small, self-contained module
// (see docs/05-architecture.md and docs/06-scanner-logic.md).
import type { CheerioAPI } from "cheerio";

export type SignalCategory =
  | "fingerprint" // 🏷️ tool fingerprints (highest confidence)
  | "default-stack" // 🎨 untouched defaults
  | "copy" // 📝 text / writing tells
  | "layout" // 🧱 design / layout tells
  | "leftover" // 🔧 placeholder junk
  | "stack" // ☁️ hosting / framework combos
  | "quality" // 🧹 low-effort / unpolished build tells
  | "human"; // 🤍 signs a human was involved (negative weight — lowers the score)

/** Everything a rule gets to inspect about a fetched page. */
export interface ScanContext {
  readonly url: URL;
  readonly finalUrl: string;
  readonly html: string;
  readonly $: CheerioAPI;
  readonly headers: Record<string, string>;
}

/** Result of a rule that matched. `evidence` is the snippet shown on the card. */
export interface SignalHit {
  evidence?: string;
  /**
   * True when the match rests on a name-string alone (not a hosting domain or
   * injected attribute). Multiple weak fingerprint hits on one page mean the
   * page is *about* those builders, so scoring discards them (score.ts).
   */
  weak?: boolean;
}

export interface SignalRule {
  readonly id: string; // stable, e.g. "fingerprint.v0"
  readonly category: SignalCategory;
  readonly weight: number; // points added to the Slop Score when matched
  readonly label: string; // short human label ("Built with v0.dev")
  readonly description: string; // one line explaining the tell
  /** Return a hit (optionally with evidence) when the tell is present, else null. */
  test(ctx: ScanContext): SignalHit | null;
}

export interface MatchedSignal {
  id: string;
  category: SignalCategory;
  label: string;
  description: string;
  weight: number;
  evidence?: string;
  weak?: boolean;
}

export interface DetectedTech {
  name: string;
  category?: string;
  confidence: number;
}

export type Tier =
  | "Hand-Crafted"
  | "Suspiciously Clean"
  | "Vibe-Coded"
  | "Pure Slop";

export interface ScanResult {
  url: string;
  finalUrl: string;
  host: string;
  title?: string;
  score: number; // 0–100 Slop Score
  tier: Tier;
  signals: MatchedSignal[];
  tech: DetectedTech[];
  fetchError?: string;
}
