// GET /api/leaderboard → { shame, fame, total }
// shame = highest Slop Scores, fame = lowest. Powers the home preview and the
// full leaderboard page (which filters/paginates client-side).
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface Row { host: string; slug: string; score: number }
const toRows = (rows: Row[]) => rows.map((r) => ({ domain: r.host, slug: r.slug, score: r.score }));

export async function GET() {
  try {
    const [shame, fame, total] = await Promise.all([
      db.check.findMany({ orderBy: [{ score: "desc" }, { updatedAt: "desc" }], take: 100, select: { host: true, slug: true, score: true } }),
      db.check.findMany({ orderBy: [{ score: "asc" }, { updatedAt: "desc" }], take: 100, select: { host: true, slug: true, score: true } }),
      db.check.count(),
    ]);
    return NextResponse.json({ shame: toRows(shame), fame: toRows(fame), total });
  } catch (err) {
    console.error("[/api/leaderboard] error:", err);
    return NextResponse.json({ shame: [], fame: [], total: 0 }, { status: 200 });
  }
}
