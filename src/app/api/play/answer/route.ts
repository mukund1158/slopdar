// POST /api/play/answer → submit the pick for the current question. Returns the
// reveal (real scores, identities, which was correct) and the next masked
// question, or null when the game is done. Timing is server-measured.
import { NextResponse } from "next/server";
import { z } from "zod";
import { submitAnswer, PlayError } from "@/lib/play-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({ token: z.string().min(1), checkId: z.string().min(1) });

export async function POST(req: Request) {
  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
  try {
    const result = await submitAnswer(body.token, body.checkId);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof PlayError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("[/api/play/answer] failed:", err);
    return NextResponse.json({ error: "could not record answer" }, { status: 500 });
  }
}
