// POST /api/guess-stat → { ok } — anonymous tally of the Built-or-Slop
// prompt: a "call" (with correct true/false) or a "skip". No identity and no
// cookies, just one daily counter row, so we can learn whether visitors
// actually play before investing in the daily game.
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({ action: z.enum(["call", "skip"]), correct: z.boolean().optional() });

/** Today as a UTC date-only value, matching the @db.Date column. */
function today(): Date {
  return new Date(new Date().toISOString().slice(0, 10));
}

export async function POST(req: Request) {
  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  const isCall = body.action === "call";
  const correct = isCall && body.correct === true ? 1 : 0;
  try {
    await db.guessStat.upsert({
      where: { day: today() },
      create: { day: today(), calls: isCall ? 1 : 0, correct, skips: isCall ? 0 : 1 },
      update: isCall ? { calls: { increment: 1 }, correct: { increment: correct } } : { skips: { increment: 1 } },
    });
  } catch (err) {
    // A lost data point is fine; never let the counter break the scan flow.
    console.error("[/api/guess-stat] upsert failed:", err);
    return NextResponse.json({ ok: false });
  }
  return NextResponse.json({ ok: true });
}
