// Today's leaderboard and the daily reward lock-in.
//
// The board resets every night: it only ever shows today's results, ranked by
// score then by who finished faster. So a newcomer can top it on their first
// day, no matter how long others have played.
//
// The reward: each day's top 3 get their own website shown in the NEXT day's
// games. lockFeaturedForDay picks tomorrow's featured sites from today's winners.
import { db } from "@/lib/db";
import { FEATURED_PER_DAY } from "./play-config";

export interface BoardRow {
  rank: number;
  handle: string;
  product: string | null; // their primary product name, if set
  score: number;
  correct: number;
  streak: number;
  you: boolean;
}

const primaryProduct = { where: { isPrimary: true, hidden: false }, select: { name: true }, take: 1 } as const;

const dateOnly = (d: Date) => new Date(d.toISOString().slice(0, 10));
const today = () => dateOnly(new Date());

const orderByScore = [{ score: "desc" }, { durationMs: "asc" }] as const;

/** Today's board (top `limit`), plus the caller's own row if they placed lower. */
export async function todayBoard(
  opts: { limit?: number; userId?: string | null } = {},
): Promise<{ rows: BoardRow[]; players: number; you: BoardRow | null }> {
  const day = today();
  const limit = opts.limit ?? 20;

  const [top, players] = await Promise.all([
    db.playResult.findMany({
      where: { day },
      orderBy: [...orderByScore],
      take: limit,
      include: { user: { select: { id: true, handle: true, products: primaryProduct } } },
    }),
    db.playResult.count({ where: { day } }),
  ]);

  const rows: BoardRow[] = top.map((r, i) => ({
    rank: i + 1,
    handle: r.user.handle ?? "player",
    product: r.user.products[0]?.name ?? null,
    score: r.score,
    correct: r.correct,
    streak: r.streak,
    you: opts.userId ? r.user.id === opts.userId : false,
  }));

  let you = rows.find((r) => r.you) ?? null;
  if (!you && opts.userId) {
    const mine = await db.playResult.findUnique({
      where: { userId_day: { userId: opts.userId, day } },
      include: { user: { select: { handle: true, products: primaryProduct } } },
    });
    if (mine) {
      const better = await db.playResult.count({
        where: {
          day,
          OR: [{ score: { gt: mine.score } }, { score: mine.score, durationMs: { lt: mine.durationMs } }],
        },
      });
      you = {
        rank: better + 1,
        handle: mine.user.handle ?? "player",
        product: mine.user.products[0]?.name ?? null,
        score: mine.score,
        correct: mine.correct,
        streak: mine.streak,
        you: true,
      };
    }
  }

  return { rows, players, you };
}

/**
 * Lock in the featured winner sites for `day`, drawn from the previous day's
 * top players who have a usable website set. Idempotent: safe to re-run.
 * Returns how many sites were featured (0..FEATURED_PER_DAY).
 */
export async function lockFeaturedForDay(day: Date): Promise<number> {
  const showDay = dateOnly(day);
  const prev = new Date(showDay);
  prev.setDate(prev.getDate() - 1);

  // Scan more than 3 winners in case some have no website to feature.
  const winners = await db.playResult.findMany({
    where: { day: prev },
    orderBy: [...orderByScore],
    take: 30,
    include: {
      user: {
        select: {
          id: true,
          website: { select: { id: true, gameHidden: true, scanError: true, screenshot: true } },
        },
      },
    },
  });

  const chosen: { userId: string; checkId: string }[] = [];
  const seen = new Set<string>();
  for (const w of winners) {
    const site = w.user.website;
    if (!site || site.gameHidden || site.scanError || !site.screenshot) continue;
    if (seen.has(site.id)) continue;
    seen.add(site.id);
    chosen.push({ userId: w.user.id, checkId: site.id });
    if (chosen.length >= FEATURED_PER_DAY) break;
  }

  await db.$transaction([
    db.featuredSite.deleteMany({ where: { day: showDay } }),
    ...chosen.map((c, i) =>
      db.featuredSite.create({ data: { day: showDay, checkId: c.checkId, userId: c.userId, rank: i + 1 } }),
    ),
  ]);
  return chosen.length;
}
