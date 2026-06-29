// Small helpers shared across signal rules.
import type { ScanContext } from "../types";

/** Lowercased visible text (scripts/styles removed), collapsed whitespace. */
export function visibleText(ctx: ScanContext): string {
  const $ = ctx.$;
  const clone = $.root().clone();
  clone.find("script, style, noscript, template").remove();
  return clone.text().replace(/\s+/g, " ").trim();
}

/** Lowercased raw HTML — for matching attributes, classes, asset URLs, comments. */
export function rawHtml(ctx: ScanContext): string {
  return ctx.html.toLowerCase();
}

/** The <meta name="generator"> content, lowercased, or "". */
export function metaGenerator(ctx: ScanContext): string {
  return (ctx.$('meta[name="generator"]').attr("content") ?? "").toLowerCase();
}

/** Count non-overlapping occurrences of `needle` in `haystack`. */
export function count(haystack: string, needle: string): number {
  if (!needle) return 0;
  let n = 0;
  let i = haystack.indexOf(needle);
  while (i !== -1) {
    n++;
    i = haystack.indexOf(needle, i + needle.length);
  }
  return n;
}

/** Truncate evidence snippets shown on the result card. */
export function snippet(text: string, max = 120): string {
  const t = text.trim().replace(/\s+/g, " ");
  return t.length > max ? `${t.slice(0, max)}…` : t;
}
