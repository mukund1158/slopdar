// URL normalisation + slug generation for shareable result pages.
import { assertScannableUrl } from "./ssrf";

/**
 * Normalise user input into a canonical scannable URL.
 * - prepends https:// when the scheme is missing
 * - lowercases the host, strips the fragment and a trailing slash
 * - runs the SSRF allow-check (throws SsrfError if not public http(s))
 */
export function normalizeUrl(input: string): URL {
  const trimmed = input.trim();
  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  const url = assertScannableUrl(withScheme);
  url.hostname = url.hostname.toLowerCase();
  url.hash = "";
  if (url.pathname === "/") url.pathname = "";

  return url;
}

/**
 * Build a stable, human-friendly slug for /r/[slug].
 * Root URLs collapse to the bare host (e.g. "stripe.com"); deeper paths get a
 * compact suffix so distinct pages don't collide on the same host.
 */
export function slugForUrl(url: URL): string {
  const host = url.hostname.replace(/^www\./, "");
  const path = url.pathname.replace(/\/+$/, "");
  if (!path || path === "") return host;

  const pathSlug = path
    .replace(/^\//, "")
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase()
    .slice(0, 60);

  return pathSlug ? `${host}-${pathSlug}` : host;
}
