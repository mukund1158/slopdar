// Slop of the Week / Craft of the Week: the worst and best sites first
// scanned during the current week (Monday 00:00 server time onward). Shown as
// crowned cards on /leaderboard. Sites whose scan errored are excluded so a
// broken fetch can't win either crown.
import { db } from "@/lib/db";

export interface WeeklyWinner {
  domain: string;
  slug: string;
  score: number;
  screenshot: string | null;
}

export interface WeeklyWinners {
  weekStart: Date;
  slop: WeeklyWinner | null; // highest score among this week's new sites
  craft: WeeklyWinner | null; // lowest score among this week's new sites
}

/** Monday 00:00 of the current week, server time. */
export function weekStart(now = new Date()): Date {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); // getDay(): 0 = Sunday
  return d;
}

const select = { host: true, slug: true, score: true, screenshot: true } as const;
type Row = { host: string; slug: string; score: number; screenshot: string | null };

export async function weeklyWinners(): Promise<WeeklyWinners> {
  const start = weekStart();
  // "New this week" means first scanned this week (createdAt), so an old site
  // that merely got re-roasted can't take the crown from a fresh discovery.
  // Each crown must also be earned: Slop of the Week has to actually be slop
  // (Vibe-Coded or worse), Craft of the Week has to be Hand-Crafted tier —
  // otherwise a quiet week would crown a clean site "slop". No winner → no card.
  const base = { createdAt: { gte: start }, scanError: null };
  const [slop, craft] = await Promise.all([
    db.check.findFirst({ where: { ...base, score: { gte: 51 } }, orderBy: [{ score: "desc" }, { createdAt: "asc" }], select }),
    db.check.findFirst({ where: { ...base, score: { lte: 25 } }, orderBy: [{ score: "asc" }, { createdAt: "asc" }], select }),
  ]);
  const toWinner = (r: Row | null): WeeklyWinner | null =>
    r ? { domain: r.host, slug: r.slug, score: r.score, screenshot: r.screenshot } : null;
  return { weekStart: start, slop: toWinner(slop), craft: toWinner(craft) };
}
