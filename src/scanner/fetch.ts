// Safe HTML fetch for the scanner. Uses an undici Agent wired to the SSRF-aware
// DNS lookup so every connection (including redirects) is re-validated against
// private/blocked ranges. Enforces timeout, redirect cap, and a max byte size.
import { Agent, interceptors, request } from "undici";
import { env } from "@/lib/env";
import { safeLookup, SsrfError } from "@/lib/ssrf";

export interface FetchedPage {
  finalUrl: string;
  status: number;
  headers: Record<string, string>;
  html: string;
}

// One shared agent; its connect.lookup blocks private IPs at connect time.
// The redirect interceptor follows redirects through this SAME dispatcher, so
// safeLookup re-runs on every hop (closing the DNS-rebinding / redirect hole).
const safeAgent = new Agent({
  connect: { lookup: safeLookup as any },
  connectTimeout: env.SCAN_FETCH_TIMEOUT_MS,
  // Reasonable header/body timeouts so a slow target can't hang a worker.
  headersTimeout: env.SCAN_FETCH_TIMEOUT_MS,
  bodyTimeout: env.SCAN_FETCH_TIMEOUT_MS,
}).compose(
  interceptors.redirect({ maxRedirections: env.SCAN_MAX_REDIRECTS }),
);

function headersToObject(headers: Record<string, string | string[] | undefined>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(headers)) {
    if (v == null) continue;
    out[k.toLowerCase()] = Array.isArray(v) ? v.join(", ") : v;
  }
  return out;
}

export async function fetchPage(url: URL): Promise<FetchedPage> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), env.SCAN_FETCH_TIMEOUT_MS);

  try {
    const res = await request(url.toString(), {
      dispatcher: safeAgent,
      method: "GET",
      signal: controller.signal,
      headers: {
        "user-agent": env.SCAN_USER_AGENT,
        accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "accept-language": "en-US,en;q=0.9",
      },
    });

    const headers = headersToObject(res.headers as Record<string, string | string[] | undefined>);

    // Only parse HTML-ish responses; bail early on binary/other content.
    const contentType = headers["content-type"] ?? "";
    if (contentType && !/(text\/html|application\/xhtml|text\/plain|application\/xml)/i.test(contentType)) {
      res.body.destroy();
      throw new ScanFetchError(`Unsupported content-type: ${contentType}`);
    }

    // Stream with a hard byte cap so a huge page can't exhaust memory.
    const chunks: Buffer[] = [];
    let total = 0;
    for await (const chunk of res.body) {
      const buf = chunk as Buffer;
      total += buf.length;
      if (total > env.SCAN_MAX_BYTES) {
        res.body.destroy();
        break;
      }
      chunks.push(buf);
    }

    return {
      finalUrl: url.toString(),
      status: res.statusCode,
      headers,
      html: Buffer.concat(chunks).toString("utf8"),
    };
  } catch (err) {
    if (err instanceof SsrfError) throw err;
    if (err instanceof ScanFetchError) throw err;
    if (err instanceof Error && err.name === "AbortError") {
      throw new ScanFetchError("Request timed out");
    }
    throw new ScanFetchError(err instanceof Error ? err.message : "Fetch failed");
  } finally {
    clearTimeout(timeout);
  }
}

export class ScanFetchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ScanFetchError";
  }
}
