// GET /api/leaderboard
//  - No params → { shame, fame, total }: top-10 previews for the home page.
//  - ?tab=shame|fame&page=N&q=text → { rows, total, page, totalPages }: one
//    10-row page for the /leaderboard board, paginated server-side so every
//    scanned site is reachable (not just the top 100).
import { NextRequest, NextResponse } from "next/server";
import { boardPage } from "@/lib/leaderboard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const tab = params.get("tab");

  try {
    if (tab === null) {
      const [shame, fame] = await Promise.all([boardPage("shame"), boardPage("fame")]);
      return NextResponse.json({ shame: shame.rows, fame: fame.rows, total: shame.total });
    }

    if (tab !== "shame" && tab !== "fame") {
      return NextResponse.json({ error: "tab must be 'shame' or 'fame'" }, { status: 400 });
    }

    // parseInt returns NaN on garbage; `|| 0` folds that (and negatives via
    // Math.max) back to page 0. boardPage clamps the upper bound.
    const page = Math.max(0, parseInt(params.get("page") ?? "0", 10) || 0);
    const q = params.get("q") ?? "";
    return NextResponse.json(await boardPage(tab, page, q));
  } catch (err) {
    console.error("[/api/leaderboard] error:", err);
    // Empty payload covering both response shapes, so neither consumer breaks
    // when the DB is unavailable.
    return NextResponse.json(
      { shame: [], fame: [], rows: [], total: 0, page: 0, totalPages: 1 },
      { status: 200 },
    );
  }
}
