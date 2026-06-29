// ── SSRF protection ─────────────────────────────────────────────────────────
// The scanner fetches arbitrary user-supplied URLs server-side, which is a
// textbook SSRF surface (cloud metadata at 169.254.169.254, internal services,
// loopback, DNS-rebinding). This module:
//   1. validates a URL is a public http(s) endpoint, and
//   2. exposes a custom DNS `lookup` that re-validates on EVERY connection
//      (initial request AND every redirect hop), defeating DNS rebinding.
//
// Defense-in-depth note: this blocks egress to private ranges at the app layer.
// In production also run the scanner with an egress-restricted network policy
// (firewall / container netns) — never rely on a single layer.
import dns from "node:dns";
import net from "node:net";
import { env } from "./env";

export class SsrfError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SsrfError";
  }
}

const ALLOWED_PROTOCOLS = new Set(["http:", "https:"]);

/** Convert a dotted-quad IPv4 string to a 32-bit unsigned int. */
function ipv4ToInt(ip: string): number {
  return ip.split(".").reduce((acc, octet) => (acc << 8) + Number(octet), 0) >>> 0;
}

function inV4Range(ipInt: number, cidr: string): boolean {
  const [base, bitsStr] = cidr.split("/");
  const bits = Number(bitsStr);
  const mask = bits === 0 ? 0 : (0xffffffff << (32 - bits)) >>> 0;
  return (ipInt & mask) === (ipv4ToInt(base) & mask);
}

// Non-public IPv4 ranges (private, loopback, link-local, CGNAT, reserved, etc.).
const BLOCKED_V4_CIDRS = [
  "0.0.0.0/8",
  "10.0.0.0/8",
  "100.64.0.0/10", // CGNAT
  "127.0.0.0/8", // loopback
  "169.254.0.0/16", // link-local (incl. 169.254.169.254 cloud metadata)
  "172.16.0.0/12",
  "192.0.0.0/24",
  "192.0.2.0/24", // TEST-NET-1
  "192.168.0.0/16",
  "198.18.0.0/15", // benchmarking
  "198.51.100.0/24", // TEST-NET-2
  "203.0.113.0/24", // TEST-NET-3
  "224.0.0.0/4", // multicast
  "240.0.0.0/4", // reserved
  "255.255.255.255/32",
];

function isPrivateV4(ip: string): boolean {
  const asInt = ipv4ToInt(ip);
  return BLOCKED_V4_CIDRS.some((cidr) => inV4Range(asInt, cidr));
}

function isPrivateV6(ip: string): boolean {
  const addr = ip.toLowerCase();
  // IPv4-mapped (::ffff:1.2.3.4) — validate the embedded v4.
  const mapped = addr.match(/::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (mapped) return isPrivateV4(mapped[1]);
  if (addr === "::1" || addr === "::") return true; // loopback / unspecified
  if (addr.startsWith("fe80")) return true; // link-local
  if (addr.startsWith("fc") || addr.startsWith("fd")) return true; // unique-local fc00::/7
  if (addr.startsWith("ff")) return true; // multicast
  return false;
}

/** True if `ip` is a non-public address we must refuse to connect to. */
export function isPrivateIp(ip: string): boolean {
  const family = net.isIP(ip);
  if (family === 4) return isPrivateV4(ip);
  if (family === 6) return isPrivateV6(ip);
  return true; // not a recognisable IP → refuse
}

/**
 * Validate a raw URL string for scanning. Returns a normalised URL object.
 * Throws SsrfError on anything that isn't a public http(s) endpoint.
 * (DNS is not resolved here — that happens at connect time via `safeLookup`.)
 */
export function assertScannableUrl(raw: string): URL {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new SsrfError("Not a valid URL");
  }

  if (!ALLOWED_PROTOCOLS.has(url.protocol)) {
    throw new SsrfError(`Unsupported protocol: ${url.protocol}`);
  }
  if (url.username || url.password) {
    throw new SsrfError("Credentials in URL are not allowed");
  }

  const host = url.hostname.toLowerCase();
  if (!host) throw new SsrfError("Missing host");

  // Block obvious local names and any literal private IP up front.
  if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local")) {
    if (!env.ALLOW_PRIVATE_HOSTS) throw new SsrfError("Local hostnames are not allowed");
  }
  if (net.isIP(host) && isPrivateIp(host)) {
    if (!env.ALLOW_PRIVATE_HOSTS) throw new SsrfError("Private IP addresses are not allowed");
  }

  return url;
}

/**
 * A drop-in replacement for dns.lookup that REFUSES to resolve to a private IP.
 * Pass this to undici's Agent `connect.lookup` so it runs on every connection,
 * including redirect targets — closing the DNS-rebinding hole.
 */
export function safeLookup(
  hostname: string,
  options: dns.LookupOneOptions | dns.LookupAllOptions | number,
  callback: (err: NodeJS.ErrnoException | null, address: any, family?: number) => void,
): void {
  dns.lookup(hostname, { all: true }, (err, addresses) => {
    if (err) return callback(err, null);
    if (!addresses || addresses.length === 0) {
      return callback(new SsrfError(`No DNS records for ${hostname}`) as NodeJS.ErrnoException, null);
    }

    const allowPrivate = env.ALLOW_PRIVATE_HOSTS;
    const safe = addresses.filter((a) => allowPrivate || !isPrivateIp(a.address));

    if (safe.length === 0) {
      return callback(
        new SsrfError(`${hostname} resolves only to private/blocked addresses`) as NodeJS.ErrnoException,
        null,
      );
    }

    // undici passes `{ all: true }`; honour both shapes for safety.
    const wantsAll = typeof options === "object" && options.all === true;
    if (wantsAll) {
      callback(null, safe as any);
    } else {
      callback(null, safe[0].address, safe[0].family);
    }
  });
}
