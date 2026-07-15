// POST /api/play/start → begin a fresh game and return the first question
// (masked: screenshots only, no scores, no identities). Identity is fixed here:
// a logged-in player's first game today is ranked, everything else is practice.
import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { startGame, PoolShortageError } from "@/lib/play-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const userId = await getSessionUserId();
    const result = await startGame(userId);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof PoolShortageError) {
      // Not enough scored sites yet to build a game (mostly a pre-launch state).
      return NextResponse.json({ error: "not enough sites to build a game yet" }, { status: 503 });
    }
    console.error("[/api/play/start] failed:", err);
    return NextResponse.json({ error: "could not start a game" }, { status: 500 });
  }
}
