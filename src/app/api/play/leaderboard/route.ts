// GET /api/play/leaderboard → today's board (top 20), plus the caller's own row
// if they placed below it. Resets every night with the day.
import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { todayBoard } from "@/lib/play-board";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const userId = await getSessionUserId();
    const board = await todayBoard({ userId, limit: 10 });
    return NextResponse.json(board);
  } catch (err) {
    console.error("[/api/play/leaderboard] failed:", err);
    return NextResponse.json({ error: "could not load the leaderboard" }, { status: 500 });
  }
}
