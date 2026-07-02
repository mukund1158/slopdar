// URL normalisation + slug generation for shareable result pages.
import { assertScannableUrl } from "./ssrf";

/**
 * Normalise user input into a canonical scannable URL.
 * - prepends https:// when the scheme is missing
 * - lowercases the host
 * - collapses the URL to the site root: path, query and fragment are dropped,
 *   so "linear.app/contact" and "linear.app" are the same check
 * - runs the SSRF allow-check (throws SsrfError if not public http(s))
 */
export function normalizeUrl(input: string): URL {
  const trimmed = input.trim();
  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  const url = assertScannableUrl(withScheme);
  url.hostname = url.hostname.toLowerCase();
  url.pathname = "";
  url.search = "";
  url.hash = "";

  return url;
}

/**
 * Build a stable, human-friendly slug for /r/[slug]. URLs are always
 * root-level (see normalizeUrl), so the slug is just the bare host; the
 * caller disambiguates http/https/www variants that collide on it.
 */
export function slugForUrl(url: URL): string {
  return url.hostname.replace(/^www\./, "");
}
