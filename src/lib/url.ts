// URL normalisation + slug generation for shareable result pages.
import { assertScannableUrl } from "./ssrf";

/**
 * Normalise user input into a canonical scannable URL.
 * - prepends https:// when the scheme is missing
 * - lowercases the host
 * - strips a leading "www.": www.google.com and google.com are the same
 *   check, while real subdomains (mukund.google.com) stay distinct
 * - collapses the URL to the site root: path, query and fragment are dropped,
 *   so "linear.app/contact" and "linear.app" are the same check
 * - runs the SSRF allow-check (throws SsrfError if not public http(s))
 */
export function normalizeUrl(input: string): URL {
  const trimmed = input.trim();
  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  const url = assertScannableUrl(withScheme);
  url.hostname = stripWww(url.hostname.toLowerCase());
  url.pathname = "";
  url.search = "";
  url.hash = "";

  return url;
}

/**
 * Drop a leading "www." label, keeping the host valid: "www.com" itself must
 * not collapse to the bare TLD "com", so the remainder needs a dot of its own.
 */
export function stripWww(hostname: string): string {
  const rest = hostname.slice(4);
  return hostname.startsWith("www.") && rest.includes(".") ? rest : hostname;
}

/**
 * Build a stable, human-friendly slug for /r/[slug]. URLs are always
 * root-level (see normalizeUrl), so the slug is just the bare host; the
 * caller disambiguates http/https/www variants that collide on it.
 */
export function slugForUrl(url: URL): string {
  return stripWww(url.hostname);
}
