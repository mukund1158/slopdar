// GET /api/stats → { total } — the live "sites roasted" count.
// Cached in Redis for a few seconds so frequent polling stays cheap.
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { redis } from "@/lib/redis";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const KEY = "stats:total";

export async function GET() {
  try {
    const cached = await redis.get(KEY);
    if (cached != null) return NextResponse.json({ total: Number(cached) });
  } catch {
    /* redis down — fall through to a live count */
  }

  let total = 0;
  try {
    total = await db.check.count();
  } catch (err) {
    console.error("[/api/stats] count failed:", err);
    return NextResponse.json({ total: 0 }, { status: 200 });
  }

  redis.set(KEY, String(total), "EX", 3).catch(() => {});
  return NextResponse.json({ total });
}
