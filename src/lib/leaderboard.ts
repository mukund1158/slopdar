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
