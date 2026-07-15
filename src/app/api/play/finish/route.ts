// POST /api/play/finish → score the finished game and, for a ranked run, save
// the result and advance the streak. Returns the score breakdown and today's
// rank (for ranked games).
import { NextResponse } from "next/server";
import { z } from "zod";
import { finishGame, PlayError } from "@/lib/play-service";

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
    const result = await finishGame(body.token);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof PlayError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("[/api/play/finish] failed:", err);
    return NextResponse.json({ error: "could not finish the game" }, { status: 500 });
  }
}
