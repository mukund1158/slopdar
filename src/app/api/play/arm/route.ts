// POST /api/play/arm → start the clock for the first question (called when the
// player taps Play), so the wait before pressing Play isn't timed.
import { NextResponse } from "next/server";
import { z } from "zod";
import { armGame, PlayError } from "@/lib/play-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({ token: z.string().min(1) });

export async function POST(req: Request) {
  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
  try {
    await armGame(body.token);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof PlayError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("[/api/play/arm] failed:", err);
    return NextResponse.json({ error: "could not start the round" }, { status: 500 });
  }
}
