// POST /api/check  →  { url } → run a scan → return the Slop Score + receipts.
// Validates input, rate-limits per IP, and maps domain errors to HTTP statuses.
import { NextResponse } from "next/server";
import { z } from "zod";
import { runCheck } from "@/server/check-service";
import { rateLimit, clientIp } from "@/server/rate-limit";
import { SsrfError } from "@/lib/ssrf";
import { ScanFetchError } from "@/scanner";

// Scanner + Playwright need the Node.js runtime (not edge).
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  url: z.string().min(1).max(2048),
  force: z.boolean().optional(),
});

export async function POST(req: Request) {
  // 1. Rate limit per client IP.
  const ip = clientIp(req.headers);
  const rl = await rateLimit(`check:${ip}`);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Slow down a sec. 🌊", retryAfter: rl.resetSeconds },
      { status: 429, headers: { "Retry-After": String(rl.resetSeconds) } },
    );
  }

  // 2. Validate body.
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "A valid `url` is required" }, { status: 400 });
  }

  // 3. Run the check.
  try {
    const result = await runCheck(parsed.data.url, { force: parsed.data.force });
    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    if (err instanceof SsrfError) {
      // Refused for safety — don't scan private/blocked endpoints.
      return NextResponse.json({ error: `Can't scan that URL: ${err.message}` }, { status: 422 });
    }
    if (err instanceof ScanFetchError) {
      return NextResponse.json(
        { error: `Couldn't reach that site: ${err.message}` },
        { status: 502 },
      );
    }
    console.error("[/api/check] unexpected error:", err);
    return NextResponse.json({ error: "Something went wrong scanning that site." }, { status: 500 });
  }
}
