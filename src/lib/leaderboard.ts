// Shared leaderboard query: one 10-row page of checks, sorted worst-first
// ("shame") or best-first ("fame"), optionally filtered by host substring.
// Used by the /leaderboard server seed and the /api/leaderboard route so the
// two can never disagree on ordering or page size.
import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";

export const PAGE_SIZE = 10;

export type BoardTab = "shame" | "fame";
export interface BoardRow { domain: string; slug: string; score: number; checkCount: number }
export interface BoardPage { rows: BoardRow[]; total: number; page: number; totalPages: number }

const select = { host: true, slug: true, score: true, checkCount: true } as const;

// Ties broken by updatedAt then id so pagination is stable: sites with the
// same score keep a fixed order, so rows never repeat or vanish across pages.
const orderFor = (tab: BoardTab): Prisma.CheckOrderByWithRelationInput[] => [
  { score: tab === "shame" ? "desc" : "asc" },
  { updatedAt: "desc" },
  { id: "asc" },
];

/**
 * Window start for the home-page boards: start of today (server time), widened
 * just enough to keep the boards full when today alone has fewer than
 * PAGE_SIZE sites. E.g. at 00:15 with one scan so far, the window slides back
 * to include yesterday's sites (and further if needed) until PAGE_SIZE sites
 * fit. Rescans count as fresh activity because they bump updatedAt.
 */
async function homeWindowStart(): Promise<Date | undefined> {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const recent = await db.check.findMany({
    orderBy: { updatedAt: "desc" },
    take: PAGE_SIZE,
    select: { updatedAt: true },
  });
  // Fewer than PAGE_SIZE sites in the whole DB: no window, show everything.
  if (recent.length < PAGE_SIZE) return undefined;
  const oldestOfRecent = recent[recent.length - 1].updatedAt;
  return oldestOfRecent < todayStart ? oldestOfRecent : todayStart;
}

/** Home-page boards: today's sites ranked by score, backfilled with the most
 *  recently active older sites whenever today alone can't fill the boards. */
export async function homeBoards(): Promise<{ shame: BoardRow[]; fame: BoardRow[]; total: number }> {
  const [windowStart, total] = await Promise.all([homeWindowStart(), db.check.count()]);
  const where = windowStart ? { updatedAt: { gte: windowStart } } : undefined;
  const [shame, fame] = await Promise.all([
    db.check.findMany({ where, orderBy: orderFor("shame"), take: PAGE_SIZE, select }),
    db.check.findMany({ where, orderBy: orderFor("fame"), take: PAGE_SIZE, select }),
  ]);
  const toRow = (r: { host: string; slug: string; score: number; checkCount: number }): BoardRow =>
    ({ domain: r.host, slug: r.slug, score: r.score, checkCount: r.checkCount });
  return { shame: shame.map(toRow), fame: fame.map(toRow), total };
}

export async function boardPage(tab: BoardTab, requestedPage = 0, q = ""): Promise<BoardPage> {
  const query = q.trim().slice(0, 100);
  // MySQL utf8mb4's default collation makes `contains` case-insensitive.
  const where = query ? { host: { contains: query } } : undefined;

  const total = await db.check.count({ where });
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(Math.max(0, requestedPage), totalPages - 1);

  const rows = await db.check.findMany({
    where,
    orderBy: orderFor(tab),
    skip: page * PAGE_SIZE,
    take: PAGE_SIZE,
    select,
  });
  return {
    rows: rows.map((r) => ({ domain: r.host, slug: r.slug, score: r.score, checkCount: r.checkCount })),
    total,
    page,
    totalPages,
  };
}
