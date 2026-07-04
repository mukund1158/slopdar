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

/**
 * Lowercased "technical surface" of the page: script/link URLs, meta tags and
 * HTML comments — the places a site builder leaves artifacts. Deliberately
 * excludes visible text, <a href> links and inline script bodies (SSR
 * frameworks embed the article text there as JSON), so a page that merely
 * *talks about* a builder doesn't match rules meant to detect being *built
 * with* one.
 */
export function techSurface(ctx: ScanContext): string {
  const $ = ctx.$;
  const parts: string[] = [];
  $("script[src]").each((_, el) => {
    parts.push($(el).attr("src") ?? "");
  });
  $("link[href]").each((_, el) => {
    parts.push($(el).attr("href") ?? "");
  });
  // Meta tag names are technical; meta *content* is only safe for the
  // generator tag — description/og:* content is article prose.
  $("meta").each((_, el) => {
    parts.push($(el).attr("name") ?? "", $(el).attr("property") ?? "");
  });
  parts.push($('meta[name="generator"]').attr("content") ?? "");
  for (const m of ctx.html.matchAll(/<!--[\s\S]*?-->/g)) parts.push(m[0]);
  return parts.join("\n").toLowerCase();
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
