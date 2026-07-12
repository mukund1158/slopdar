// POST /api/play/claim → after a guest logs in, lock the game they just
// finished to their account so it lands on today's leaderboard. Requires login.
import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUserId } from "@/lib/auth";
import { claimGame, PlayError } from "@/lib/play-service";

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
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "not signed in" }, { status: 401 });
  try {
    const result = await claimGame(body.token, userId);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof PlayError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("[/api/play/claim] failed:", err);
    return NextResponse.json({ error: "could not lock your result" }, { status: 500 });
  }
}
