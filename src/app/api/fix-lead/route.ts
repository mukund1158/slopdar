// POST /api/fix-lead → { ok } — records the email a visitor leaves to unlock
// the fix prompt on a report page. One row per unlock event; the same email
// showing up across several sites is useful signal, not a duplicate.
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { rateLimit, clientIp } from "@/server/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  email: z.string().max(320).email(),
  action: z.enum(["copy", "peek"]),
  slug: z.string().max(255).optional(),
  host: z.string().max(255).optional(),
});

export async function POST(req: Request) {
  const ip = clientIp(req.headers);
  const rl = await rateLimit(`fix-lead:${ip}`);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "too many requests" },
      { status: 429, headers: { "Retry-After": String(rl.resetSeconds) } },
    );
  }

  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  try {
    await db.fixPromptLead.create({
      data: {
        email: body.email.trim().toLowerCase(),
        action: body.action,
        slug: body.slug,
        host: body.host,
      },
    });
  } catch (err) {
    // A lost lead is annoying but must never block the prompt itself.
    console.error("[/api/fix-lead] create failed:", err);
    return NextResponse.json({ ok: false });
  }
  return NextResponse.json({ ok: true });
}
